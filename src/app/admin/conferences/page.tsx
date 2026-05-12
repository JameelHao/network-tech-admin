import { Topbar } from "@/components/admin/Topbar";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
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
import { conferenceStatus, formatDateRange } from "@/lib/admin/format";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { FavoriteFilter } from "@/components/admin/FavoriteFilter";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { FilterDateRange } from "@/components/admin/FilterControls";
import { CONF_SORTABLE } from "@/lib/admin/conferences";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MobileFilterPanel } from "@/components/admin/MobileFilterPanel";
import { OverflowMenu } from "@/components/admin/OverflowMenu";
import { tabClass } from "@/lib/admin/ui";
import type { SortDir } from "@/lib/admin/pagination";

const CATEGORY_KEYS: (TopicCategory | "all")[] = ["all", "network-systems", "measurement", "security", "emerging", "infrastructure"];

export default async function ConferencesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const cat = typeof sp.cat === "string" ? sp.cat : undefined;
  const view = (typeof sp.view === "string" && sp.view === "calendar") ? "calendar" as const : "list" as const;
  const monthParam = typeof sp.month === "string" ? sp.month : undefined;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp);

  const activeCategory = CATEGORY_KEYS.includes(cat as TopicCategory) ? cat as TopicCategory : "all";
  const statusFilter = typeof sp.status === "string" ? sp.status : undefined;
  const dateFrom = typeof sp.dateFrom === "string" ? sp.dateFrom : undefined;
  const dateTo = typeof sp.dateTo === "string" ? sp.dateTo : undefined;
  const result = await listConferences(params, { category: activeCategory, status: statusFilter, dateFrom, dateTo });
  const conferences = result.data;

  const supabase = await createClient();
  const { count: totalCount } = await supabase.from("conferences").select("*", { count: "exact", head: true });
  const total = totalCount ?? 0;

  const today = new Date().toISOString().slice(0, 10);
  const { count: upcomingCount } = await supabase.from("conferences").select("*", { count: "exact", head: true }).gte("end_date", today);
  const upcoming = upcomingCount ?? 0;
  const past = total - upcoming;

  const { count: topCount } = await supabase.from("conferences").select("*", { count: "exact", head: true }).eq("tier", "top");

  const sortCol = typeof sp.sort === "string" ? sp.sort : undefined;
  const sortDir = typeof sp.dir === "string" ? sp.dir as SortDir : undefined;

  const filterParams: Record<string, string> = {};
  if (activeCategory !== "all") filterParams.cat = activeCategory;
  if (statusFilter) filterParams.status = statusFilter;
  if (dateFrom) filterParams.dateFrom = dateFrom;
  if (dateTo) filterParams.dateTo = dateTo;
  if (sortCol && sortDir) { filterParams.sort = sortCol; filterParams.dir = sortDir; }

  const activeFilters: { label: string; value: string }[] = [];
  if (activeCategory !== "all") activeFilters.push({ label: t.conf.category, value: TOPIC_CATEGORIES[activeCategory][lang] });
  if (statusFilter) activeFilters.push({ label: t.conf.status, value: statusFilter === "upcoming" ? t.conf.upcomingLabel : t.conf.pastLabel });
  if (dateFrom) activeFilters.push({ label: t.filter.dateFrom, value: dateFrom });
  if (dateTo) activeFilters.push({ label: t.filter.dateTo, value: dateTo });

  const clearParams = new URLSearchParams();
  if (sortCol && sortDir) { clearParams.set("sort", sortCol); clearParams.set("dir", sortDir); }
  if (view === "calendar") clearParams.set("view", "calendar");
  const clearHref = clearParams.toString() ? `/admin/conferences?${clearParams.toString()}` : "/admin/conferences";

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
          <section data-fav-filter="conferences" className="rounded-lg border border-line bg-surface overflow-hidden">
            <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line bg-paper/30">
              <div className="hidden lg:flex items-center gap-2 overflow-x-auto">
                {CATEGORY_KEYS.map((key) => {
                  const isActive = key === activeCategory;
                  const label = key === "all" ? t.conf.filterAll : TOPIC_CATEGORIES[key][lang];
                  const p = new URLSearchParams(filterParams);
                  p.delete("cat"); p.delete("page");
                  if (key !== "all") p.set("cat", key);
                  const href = p.toString() ? `/admin/conferences?${p.toString()}` : "/admin/conferences";
                  return (
                    <Link
                      key={key}
                      href={href}
                      className={tabClass(isActive, "sm")}
                    >
                      {label}
                    </Link>
                  );
                })}
                <span className="text-ink-300 text-[10px]">|</span>
                {(["", "upcoming", "past"] as const).map((s) => {
                  const isActive = (statusFilter ?? "") === s;
                  const label = s === "" ? t.filter.allStatuses : s === "upcoming" ? t.filter.upcoming : t.filter.past;
                  const p = new URLSearchParams(filterParams);
                  p.delete("status"); p.delete("page");
                  if (s) p.set("status", s);
                  const href = p.toString() ? `/admin/conferences?${p.toString()}` : "/admin/conferences";
                  return (
                    <Link key={s} href={href} className={tabClass(isActive, "sm")}>
                      {label}
                    </Link>
                  );
                })}
                <FilterDateRange
                  fromKey="dateFrom" toKey="dateTo"
                  fromValue={dateFrom ?? ""} toValue={dateTo ?? ""}
                  fromLabel={t.filter.dateFrom} toLabel={t.filter.dateTo}
                  searchParams={filterParams}
                />
              </div>
              <MobileFilterPanel label={t.filter.filterLabel} activeCount={activeFilters.length}>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_KEYS.map((key) => {
                    const isActive = key === activeCategory;
                    const label = key === "all" ? t.conf.filterAll : TOPIC_CATEGORIES[key][lang];
                    const p = new URLSearchParams(filterParams);
                    p.delete("cat"); p.delete("page");
                    if (key !== "all") p.set("cat", key);
                    const href = p.toString() ? `/admin/conferences?${p.toString()}` : "/admin/conferences";
                    return <Link key={key} href={href} className={tabClass(isActive, "sm")}>{label}</Link>;
                  })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["", "upcoming", "past"] as const).map((s) => {
                    const isActive = (statusFilter ?? "") === s;
                    const label = s === "" ? t.filter.allStatuses : s === "upcoming" ? t.filter.upcoming : t.filter.past;
                    const p = new URLSearchParams(filterParams);
                    p.delete("status"); p.delete("page");
                    if (s) p.set("status", s);
                    const href = p.toString() ? `/admin/conferences?${p.toString()}` : "/admin/conferences";
                    return <Link key={s} href={href} className={tabClass(isActive, "sm")}>{label}</Link>;
                  })}
                </div>
                <FilterDateRange
                  fromKey="dateFrom" toKey="dateTo"
                  fromValue={dateFrom ?? ""} toValue={dateTo ?? ""}
                  fromLabel={t.filter.dateFrom} toLabel={t.filter.dateTo}
                  searchParams={filterParams}
                />
              </MobileFilterPanel>
              <div className="flex items-center gap-2 shrink-0">
                <FavoriteFilter entity="conferences" labels={{ favorites: t.favorite.favorites, all: t.favorite.all }} />
                <ViewToggle
                  active="list"
                  basePath="/admin/conferences"
                  searchParams={filterParams}
                  labels={{ list: t.conf.viewList, calendar: t.conf.viewCalendar }}
                />
                <div className="hidden lg:flex items-center gap-2">
                  <ExportButton entity="conferences" format="csv" filters={filterParams} label={t.common.exportCSV} />
                  <ExportButton entity="conferences" format="json" filters={filterParams} label={t.common.exportJSON} />
                </div>
                <OverflowMenu>
                  <ExportButton entity="conferences" format="csv" filters={filterParams} label={t.common.exportCSV} />
                  <ExportButton entity="conferences" format="json" filters={filterParams} label={t.common.exportJSON} />
                </OverflowMenu>
                <RefreshAllButton label={t.conf.refresh} />
                <Link
                  href="/admin/conferences/new"
                  className="rounded-md bg-navy-700 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-navy-50 hover:bg-navy-600 transition-colors"
                >
                  + {t.conf.addNew}
                </Link>
              </div>
            </header>

            <FilterSummary filters={activeFilters} labels={{ activeFilters: t.filter.activeFilters, clearAll: t.filter.clearAll }} clearHref={clearHref} />
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-paper/30">
                    <SortableHeader column="name" label={t.conf.conference} currentSort={sortCol} currentDir={sortDir} basePath="/admin/conferences" searchParams={filterParams} />
                    <Th>{t.conf.status}</Th>
                    <SortableHeader column="category" label={t.conf.category} currentSort={sortCol} currentDir={sortDir} basePath="/admin/conferences" searchParams={filterParams} />
                    <SortableHeader column="tier" label={t.conf.tier} currentSort={sortCol} currentDir={sortDir} basePath="/admin/conferences" searchParams={filterParams} className="hidden lg:table-cell" />
                    <Th className="hidden lg:table-cell">{t.detail.topics}</Th>
                    <Th>{t.detail.location}</Th>
                    <SortableHeader column="start_date" label={t.detail.date} currentSort={sortCol} currentDir={sortDir} basePath="/admin/conferences" searchParams={filterParams} />
                    <Th className="hidden lg:table-cell">{t.list.link}</Th>
                    <Th className="hidden lg:table-cell">★</Th>
                  </tr>
                </thead>
                <tbody>
                  {conferences.map((c) => {
                    const status = conferenceStatus(c.start_date, c.end_date, lang);
                    const statusColor = status.variant === "ongoing" ? "text-blue-700" : status.variant === "upcoming" ? "text-moss-700" : "text-ink-500";
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
                          <span className={`font-mono text-[10.5px] uppercase tracking-[0.16em] ${statusColor}`}>
                            {status.label}
                          </span>
                        </Td>
                        <Td>
                          {c.category ? (
                            <span className="rounded-full bg-ink-100 px-2 py-0.5 font-mono text-[10px] text-ink-600">
                              {TOPIC_CATEGORIES[c.category]?.[lang] ?? c.category}
                            </span>
                          ) : <span className="text-ink-400">—</span>}
                        </Td>
                        <Td className="hidden lg:table-cell">
                          <TierBadge tier={(c as unknown as { tier: "top" | "good" | "workshop" }).tier ?? "good"} lang={lang} />
                        </Td>
                        <Td className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1.5">
                            {c.topics.slice(0, 3).map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}
                            {c.topics.length > 3 && <span className="text-[10px] text-ink-400">+{c.topics.length - 3}</span>}
                          </div>
                        </Td>
                        <Td><span className="text-ink-700">{c.location ?? "—"}</span></Td>
                        <Td className="whitespace-nowrap"><span className="font-mono text-[11.5px] tabular-nums text-ink-700">{formatDateRange(c.start_date, c.end_date)}</span></Td>
                        <Td className="hidden lg:table-cell">
                          {c.url ? (
                            <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-navy-500 hover:text-navy-700">
                              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3.5h-2a1.5 1.5 0 0 0-1.5 1.5v7a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5v-2m-4-7h5m0 0v5m0-5-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </a>
                          ) : <span className="text-ink-300">—</span>}
                        </Td>
                        <Td className="hidden lg:table-cell"><FavoriteButton entity="conferences" id={c.id} label={c.abbreviation ?? c.name} /></Td>
                      </tr>
                    );
                  })}
                  {conferences.length === 0 && (
                    <tr><td colSpan={9}>
                      <EmptyState title={t.empty.conferences} description={t.empty.conferencesDesc} action={{ label: t.conf.addNew, href: "/admin/conferences/new" }} />
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

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 sm:px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 text-left ${className ?? ""}`}>{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 sm:px-4 py-3 align-middle ${className ?? ""}`}>{children}</td>;
}
