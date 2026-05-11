import { Topbar } from "@/components/admin/Topbar";
import { Pagination } from "@/components/admin/Pagination";
import { TopicTag } from "@/components/admin/TopicTag";
import { TierBadge } from "@/components/admin/TierBadge";
import { ExportButton } from "@/components/admin/ExportButton";
import { RefreshAllButton } from "@/components/admin/RefreshAllButton";
import { ViewToggle } from "@/components/admin/ViewToggle";
import { CalendarView } from "@/components/admin/calendar/CalendarView";
import { listConferences, listConferencesByMonth, listConferencesByYear } from "@/lib/admin/conferences";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { parseMonthKey } from "@/lib/admin/calendar-utils";
import { getDict } from "@/lib/i18n/server";
import { TOPIC_CATEGORIES, type TopicCategory } from "@/lib/admin/topics";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const CATEGORY_KEYS: (TopicCategory | "all")[] = ["all", "network-systems", "measurement", "security", "emerging", "infrastructure"];

export default async function ConferencesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const cat = typeof sp.cat === "string" ? sp.cat : undefined;
  const view = (typeof sp.view === "string" && sp.view === "calendar") ? "calendar" as const : "list" as const;
  const monthParam = typeof sp.month === "string" ? sp.month : undefined;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp);

  const activeCategory = CATEGORY_KEYS.includes(cat as TopicCategory) ? cat as TopicCategory : "all";
  const result = await listConferences(params, { category: activeCategory });
  const conferences = result.data;

  const supabase = await createClient();
  const { count: totalCount } = await supabase.from("conferences").select("*", { count: "exact", head: true });
  const total = totalCount ?? 0;

  const today = new Date().toISOString().slice(0, 10);
  const { count: upcomingCount } = await supabase.from("conferences").select("*", { count: "exact", head: true }).gte("end_date", today);
  const upcoming = upcomingCount ?? 0;
  const past = total - upcoming;

  const { count: topCount } = await supabase.from("conferences").select("*", { count: "exact", head: true }).eq("tier", "top");

  const filterParams: Record<string, string> = {};
  if (activeCategory !== "all") filterParams.cat = activeCategory;

  const now = new Date();
  let calYear = now.getFullYear();
  let calMonth = now.getMonth() + 1;
  if (monthParam) {
    const parsed = parseMonthKey(monthParam);
    if (parsed.year && parsed.month) {
      calYear = parsed.year;
      calMonth = parsed.month;
    }
  }

  const [calConferences, yearConferences] = view === "calendar"
    ? await Promise.all([listConferencesByMonth(calYear, calMonth), listConferencesByYear(calYear)])
    : [[], []];

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.conferences }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
            {t.nav.conferences}
          </p>
          <p className="mt-4 max-w-2xl text-[13.5px] text-ink-500">
            {t.conf.description}
          </p>
        </header>

        <section className="mb-4 rounded-lg border border-line bg-surface overflow-hidden">
          <div className="px-5 py-3 border-b border-line bg-paper/30">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              {t.conf.overview}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            <Stat label={t.conf.total} value={total} sub={t.conf.tracked} />
            <Stat label={t.conf.upcoming} value={upcoming} sub={t.conf.scheduledAhead} />
            <Stat label={t.conf.past} value={past} sub={t.conf.completed} />
            <Stat label={t.conf.topTier} value={topCount ?? 0} sub={t.conf.highestTier} />
          </div>
        </section>

        {view === "list" ? (
          <section className="rounded-lg border border-line bg-surface overflow-hidden">
            <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-line bg-paper/30">
              <div className="flex items-center gap-2 overflow-x-auto">
                {CATEGORY_KEYS.map((key) => {
                  const isActive = key === activeCategory;
                  const label = key === "all" ? t.conf.filterAll : TOPIC_CATEGORIES[key][lang];
                  return (
                    <Link
                      key={key}
                      href={key === "all" ? "/admin/conferences" : `/admin/conferences?cat=${key}`}
                      className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors whitespace-nowrap ${
                        isActive
                          ? "bg-navy-700 text-navy-50"
                          : "text-ink-500 hover:text-ink-800"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ViewToggle
                  active="list"
                  basePath="/admin/conferences"
                  searchParams={filterParams}
                  labels={{ list: t.conf.viewList, calendar: t.conf.viewCalendar }}
                />
                <ExportButton entity="conferences" format="csv" filters={filterParams} label={t.common.exportCSV} />
                <ExportButton entity="conferences" format="json" filters={filterParams} label={t.common.exportJSON} />
                <RefreshAllButton label={t.conf.refresh} />
                <Link
                  href="/admin/conferences/new"
                  className="rounded-md bg-navy-700 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-navy-50 hover:bg-navy-600 transition-colors"
                >
                  + {t.conf.addNew}
                </Link>
              </div>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-paper/30">
                    <Th>{t.conf.conference}</Th>
                    <Th>{t.conf.status}</Th>
                    <Th>{t.conf.tier}</Th>
                    <Th>{t.detail.topics}</Th>
                    <Th>{t.detail.location}</Th>
                    <Th>{t.detail.date}</Th>
                  </tr>
                </thead>
                <tbody>
                  {conferences.map((c) => {
                    const isPast = (c.end_date ?? c.start_date) < today;
                    return (
                      <tr key={c.id} className="group border-b border-line last:border-b-0 hover:bg-paper/40 transition-colors">
                        <Td>
                          <Link href={`/admin/conferences/${c.id}`} className="block">
                            <div className="font-display text-[14.5px] tracking-tight text-ink-900 group-hover:text-navy-700">
                              {c.abbreviation ?? c.name}
                            </div>
                            {c.abbreviation && (
                              <div className="font-mono text-[10.5px] text-ink-400 truncate max-w-[220px]">{c.name}</div>
                            )}
                          </Link>
                        </Td>
                        <Td>
                          <span className={`font-mono text-[10.5px] uppercase tracking-[0.16em] ${isPast ? "text-ink-500" : "text-moss-700"}`}>
                            {isPast ? t.conf.pastLabel : t.conf.upcomingLabel}
                          </span>
                        </Td>
                        <Td>
                          <TierBadge tier={(c as unknown as { tier: "top" | "good" | "workshop" }).tier ?? "good"} lang={lang} />
                        </Td>
                        <Td>
                          <div className="flex flex-wrap gap-1.5">
                            {c.topics.slice(0, 3).map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}
                            {c.topics.length > 3 && <span className="text-[10px] text-ink-400">+{c.topics.length - 3}</span>}
                          </div>
                        </Td>
                        <Td><span className="text-ink-700">{c.location ?? "—"}</span></Td>
                        <Td><span className="font-mono text-[11.5px] tabular-nums text-ink-700">{c.start_date}</span></Td>
                      </tr>
                    );
                  })}
                  {conferences.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-20 text-center">
                      <div className="font-display text-[20px] text-ink-700">{t.conf.empty}</div>
                      <p className="mt-1 text-[13px] text-ink-500">{t.conf.emptyHint}</p>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {result.totalPages > 1 && (
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                total={result.total}
                pageSize={result.pageSize}
                basePath="/admin/conferences"
                searchParams={filterParams}
                labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
              />
            )}
          </section>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-end">
              <ViewToggle
                active="calendar"
                basePath="/admin/conferences"
                searchParams={filterParams}
                labels={{ list: t.conf.viewList, calendar: t.conf.viewCalendar }}
              />
            </div>
            <CalendarView
              conferences={calConferences}
              yearConferences={yearConferences}
              year={calYear}
              month={calMonth}
              lang={lang}
              t={t}
            />
          </div>
        )}
      </main>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="bg-surface p-6">
      <p className="tracked-label">{label}</p>
      <p className="mt-3 font-display text-[30px] leading-none text-ink-900 tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-[12px] text-ink-500">{sub}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 text-left">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
}
