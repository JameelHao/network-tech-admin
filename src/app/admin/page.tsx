import { Topbar } from "@/components/admin/Topbar";
import { StatCard } from "@/components/admin/StatCard";
import { StatusPill } from "@/components/admin/StatusPill";
import { TopicTag } from "@/components/admin/TopicTag";
import { listConferences } from "@/lib/admin/conferences";
import { listPapers } from "@/lib/admin/papers";
import { listOpenSource } from "@/lib/admin/opensource";
import { listLeads, getStageCounts } from "@/lib/admin/leads";
import { getDict } from "@/lib/i18n/server";
import Link from "next/link";

export default async function DashboardPage() {
  const { lang, t } = await getDict();
  const [conferences, papers, opensource, leads] = await Promise.all([
    listConferences(),
    listPapers(),
    listOpenSource(),
    listLeads(),
  ]);

  const stageCounts = getStageCounts(leads);
  const activeLeads = leads.filter((l) => l.stage !== "archived");

  const upcoming = conferences
    .filter((c) => new Date(c.start_date) > new Date())
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard }]} t={t} lang={lang} />
      <main className="flex-1 px-6 xl:px-10 py-10 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line rounded-lg overflow-hidden border border-line">
          <StatCard label={t.dashboard.conferences} value={conferences.length} sub={t.dashboard.recorded} />
          <StatCard label={t.dashboard.papers} value={papers.length} sub={t.dashboard.recorded} />
          <StatCard label={t.dashboard.opensource} value={opensource.length} sub={t.dashboard.tracking} />
          <StatCard label={t.dashboard.activeLeads} value={activeLeads.length} accent="text-navy-500" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="rounded-lg border border-line bg-surface">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
              <h2 className="font-display text-[15px] tracking-tight text-ink-800">{t.dashboard.upcomingConferences}</h2>
              <Link href="/admin/conferences" className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-500 hover:text-navy-700 transition-colors">{t.dashboard.viewAll}</Link>
            </div>
            <div className="divide-y divide-line">
              {upcoming.length === 0 && (
                <p className="px-5 py-8 text-center text-[13px] text-ink-400">{t.dashboard.noUpcoming}</p>
              )}
              {upcoming.slice(0, 5).map((c) => (
                <Link key={c.id} href={`/admin/conferences/${c.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-paper/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink-800 truncate">{c.name}</p>
                    <p className="text-[12px] text-ink-400 mt-0.5">{c.location} · {c.start_date}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {c.topics.slice(0, 2).map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-surface">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
              <h2 className="font-display text-[15px] tracking-tight text-ink-800">{t.dashboard.latestLeads}</h2>
              <Link href="/admin/leads" className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-500 hover:text-navy-700 transition-colors">{t.dashboard.viewAll}</Link>
            </div>
            <div className="divide-y divide-line">
              {leads.slice(0, 5).map((l) => (
                <Link key={l.id} href={`/admin/leads/${l.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-paper/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink-800 truncate">{l.title}</p>
                    <p className="text-[12px] text-ink-400 mt-0.5">
                      {t.leads.source}: {t.sourceType[l.source_type]} · {l.source_label}
                    </p>
                  </div>
                  <StatusPill label={l.stage} />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-line bg-surface p-5">
          <h2 className="font-display text-[15px] tracking-tight text-ink-800 mb-4">{t.dashboard.stageDistribution}</h2>
          <div className="flex gap-6">
            {(Object.entries(stageCounts) as [string, number][]).map(([stage, count]) => (
              <div key={stage} className="flex items-center gap-2">
                <StatusPill label={stage} />
                <span className="text-[13px] font-semibold text-ink-800 tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
