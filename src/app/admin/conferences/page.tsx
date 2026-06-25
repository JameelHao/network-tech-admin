import { Topbar } from "@/components/admin/Topbar";
import { EmptyState } from "@/components/admin/EmptyState";
import { TierBadge } from "@/components/admin/TierBadge";
import { listConferences } from "@/lib/admin/conferences";
import { getDict } from "@/lib/i18n/server";
import { TOPIC_CATEGORIES } from "@/lib/admin/topics";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ConferencesPage() {
  const { lang, t } = await getDict();
  const result = await listConferences({ page: 1, pageSize: 100 });
  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...result.data].sort((a, b) => {
    const aEnd = a.end_date ?? a.start_date;
    const bEnd = b.end_date ?? b.start_date;
    const aOngoing = a.start_date <= today && aEnd >= today;
    const bOngoing = b.start_date <= today && bEnd >= today;
    const aUpcoming = a.start_date > today;
    const bUpcoming = b.start_date > today;
    // Ongoing first
    if (aOngoing && !bOngoing) return -1;
    if (!aOngoing && bOngoing) return 1;
    // Upcoming second — closest first
    if (aUpcoming && bUpcoming) return a.start_date.localeCompare(b.start_date);
    if (aUpcoming) return -1;
    if (bUpcoming) return 1;
    // Past — most recent first
    return bEnd.localeCompare(aEnd);
  });
  const conferences = sorted;

  const supabase = await createClient();
  const { data: sessionCounts } = await supabase.from("conference_sessions").select("conference_id");
  const sessionCountMap = new Map<string, number>();
  for (const s of sessionCounts ?? []) sessionCountMap.set(s.conference_id, (sessionCountMap.get(s.conference_id) ?? 0) + 1);

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.conferences }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
            {t.nav.conferences}
          </p>
        </header>

        {/* Legend */}
        <div className="flex items-center gap-5 mb-3 px-1 text-[11px] font-mono text-ink-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {lang === "zh" ? "进行中" : "Ongoing"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-navy-400" /> {lang === "zh" ? "即将开始" : "Upcoming"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ink-200" /> {lang === "zh" ? "已结束" : "Past"}
          </span>
        </div>

        <section className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="divide-y divide-line">
            {conferences.map((c) => {
              const sessions = sessionCountMap.get(c.id) ?? 0;
              const catLabel = c.category ? (TOPIC_CATEGORIES[c.category]?.[lang] ?? c.category) : null;
              const aEnd = c.end_date ?? c.start_date;
              const isOngoing = c.start_date <= today && aEnd >= today;
              const isPast = aEnd < today;
              return (
                <Link key={c.id} href={`/admin/conferences/${c.id}`}
                  className={`flex items-center gap-5 px-5 py-4 hover:bg-paper/40 transition-colors ${isOngoing ? "bg-navy-50/40" : ""}`}
                >
                  {/* Status indicator */}
                  <div className="w-3 shrink-0 flex justify-center">
                    {isOngoing ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    ) : isPast ? (
                      <span className="w-2 h-2 rounded-full bg-ink-200" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-navy-400" />
                    )}
                  </div>

                  {/* Date */}
                  <div className="w-28 shrink-0 border-r border-line pr-4">
                    <p className="font-mono text-[13px] font-bold text-ink-800 leading-none tabular-nums">
                      {c.start_date ?? "—"}
                    </p>
                    {c.start_date && (
                      <p className="font-mono text-[9px] text-ink-400 mt-1 uppercase tracking-widest">
                        {new Date(c.start_date + "T12:00:00").toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { weekday: "long" })}
                      </p>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold text-ink-900 truncate">
                        {c.abbreviation ?? c.name}
                      </span>
                      {c.tier && <TierBadge tier={c.tier} lang={lang} />}
                      {isOngoing && (
                        <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          LIVE
                        </span>
                      )}
                    </div>
                    {c.abbreviation && (
                      <p className="text-[12px] text-ink-400 truncate">{c.name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {catLabel && (
                        <span className="font-mono text-[10px] text-ink-500 bg-ink-50 px-2 py-0.5 rounded">
                          {catLabel}
                        </span>
                      )}
                      {c.location && (
                        <span className="font-mono text-[10px] text-ink-400">{c.location}</span>
                      )}
                    </div>
                  </div>

                  {/* Sessions */}
                  {sessions > 0 ? (
                    <span className="font-mono text-[11px] text-navy-600 bg-navy-50 px-2.5 py-1 rounded-md shrink-0">
                      {sessions} papers
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-ink-300 shrink-0 w-[70px] text-right">—</span>
                  )}
                </Link>
              );
            })}
            {conferences.length === 0 && (
              <div className="py-12">
                <EmptyState title={t.empty.conferences} description={t.empty.conferencesDesc} />
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
