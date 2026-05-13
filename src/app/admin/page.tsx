import { Topbar } from "@/components/admin/Topbar";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatCard } from "@/components/admin/StatCard";
import { StatusPill } from "@/components/admin/StatusPill";
import { TopicTag } from "@/components/admin/TopicTag";
import { DataSourceStatus } from "@/components/admin/DataSourceStatus";
import { Watchlist } from "@/components/admin/Watchlist";
import { listConferences } from "@/lib/admin/conferences";
import { listPapers } from "@/lib/admin/papers";
import { listOpenSource } from "@/lib/admin/opensource";
import { listLeads, getStageCounts } from "@/lib/admin/leads";
import { getDict } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const { lang, t } = await getDict();
  const supabase = await createClient();
  const [confResult, paperResult, osResult, leadResult] = await Promise.all([
    listConferences(),
    listPapers(),
    listOpenSource(),
    listLeads(),
  ]);

  const conferences = confResult.data;
  const papers = paperResult.data;
  const opensource = osResult.data;
  const leads = leadResult.data;

  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const { data: newsItems } = await supabase
    .from("news_items")
    .select("title, link, source")
    .eq("category", "news")
    .gte("pub_date", sevenDaysAgo)
    .order("pub_date", { ascending: false })
    .limit(5);

  const stageCounts = getStageCounts(leads);
  const activeLeads = leads.filter((l) => l.stage !== "archived");

  const upcoming = conferences
    .filter((c) => new Date(c.start_date) > new Date())
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  const latestPapers = papers
    .filter((p) => p.published_date && Date.now() - new Date(p.published_date).getTime() < 7 * 86_400_000)
    .slice(0, 5);

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard }]} t={t} lang={lang} />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line rounded-lg overflow-hidden border border-line">
          <StatCard label={t.dashboard.conferences} value={confResult.total} sub={t.dashboard.recorded} />
          <StatCard label={t.dashboard.papers} value={paperResult.total} sub={t.dashboard.recorded} />
          <StatCard label={t.dashboard.opensource} value={osResult.total} sub={t.dashboard.tracking} />
          <StatCard label={t.dashboard.activeLeads} value={activeLeads.length} accent="text-navy-500" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800">{t.dashboard.upcomingConferences}</h2>
              <Link href="/admin/conferences" className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-500 hover:text-navy-700 transition-colors">{t.dashboard.viewAll}</Link>
            </div>
            <div className="rounded-lg border border-line bg-surface divide-y divide-line">
              {upcoming.length === 0 && (
                <EmptyState title={t.dashboard.noUpcoming} description={t.empty.conferencesDesc} compact />
              )}
              {upcoming.slice(0, 5).map((c) => (
                <Link key={c.id} href={`/admin/conferences/${c.id}`} className="flex items-center gap-4 px-4 sm:px-5 py-3.5 hover:bg-paper/40 transition-colors min-h-[44px]">
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

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800">{t.latestPapers} <span className="text-[11px] text-ink-400 font-mono">({t.time.recentDays})</span></h2>
              <Link href="/admin/papers" className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-500 hover:text-navy-700 transition-colors">{t.dashboard.viewAll}</Link>
            </div>
            <div className="rounded-lg border border-line bg-surface divide-y divide-line">
              {latestPapers.length === 0 && (
                <EmptyState title={t.papers.noPapers} description={t.empty.papersDesc} compact />
              )}
              {latestPapers.map((p) => (
                <a key={p.id} href={p.url || `https://scholar.google.com/scholar?q=${encodeURIComponent(p.title)}`} target="_blank" rel="noopener noreferrer" className="block px-4 sm:px-5 py-3.5 hover:bg-paper/40 transition-colors min-h-[44px]">
                  <p className="text-[13px] font-medium text-ink-800 truncate">{p.title}</p>
                  <p className="text-[12px] text-ink-400 mt-0.5 truncate">
                    {p.authors.slice(0, 3).join(", ")}{p.authors.length > 3 ? ` +${p.authors.length - 3}` : ""}
                    {p.venue && <> · <span className="text-navy-500">{p.venue}</span></>}
                  </p>
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800">{t.news.latestNews} <span className="text-[11px] text-ink-400 font-mono">({t.time.recentDays})</span></h2>
              <Link href="/admin/news" className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-500 hover:text-navy-700 transition-colors">{t.dashboard.viewAll}</Link>
            </div>
            <div className="rounded-lg border border-line bg-surface divide-y divide-line">
              {(!newsItems || newsItems.length === 0) && (
                <EmptyState title={t.news.noNews} description={t.empty.newsDesc} compact />
              )}
              {(newsItems ?? []).map((item) => (
                <a key={item.link} href={item.link} target="_blank" rel="noopener noreferrer" className="block px-4 sm:px-5 py-3.5 hover:bg-paper/40 transition-colors min-h-[44px]">
                  <p className="text-[13px] font-medium text-ink-800 truncate">{item.title}</p>
                  <p className="text-[11px] text-ink-400 mt-0.5">{item.source}</p>
                </a>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800">{t.dashboard.latestLeads}</h2>
              <Link href="/admin/leads" className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-500 hover:text-navy-700 transition-colors">{t.dashboard.viewAll}</Link>
            </div>
            <div className="rounded-lg border border-line bg-surface divide-y divide-line">
              {leads.slice(0, 5).map((l) => (
                <Link key={l.id} href={`/admin/leads/${l.id}`} className="flex items-center gap-4 px-4 sm:px-5 py-3.5 hover:bg-paper/40 transition-colors min-h-[44px]">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink-800 truncate">{l.title}</p>
                    <p className="text-[12px] text-ink-400 mt-0.5">
                      {t.leads.source}: {t.sourceType[l.source_type]} · {l.source_label}
                    </p>
                  </div>
                  <StatusPill label={l.stage} lang={lang} />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <Watchlist labels={{
          watchlist: t.favorite.watchlist,
          noFavorites: t.favorite.noFavorites,
          noFavoritesDesc: t.favorite.noFavoritesDesc,
          entityLabels: {
            conferences: t.nav.conferences,
            papers: t.nav.papers,
            leads: t.nav.leads,
            talents: t.nav.talents,
            opensource: t.nav.opensource,
            news: t.nav.news,
            jobs: t.nav.jobs,
          },
        }} />

        <DataSourceStatus lang={lang} labels={{
          title: t.sync.dataSourceTitle,
          dataSource: t.sync.dataSource,
          lastSync: t.sync.lastSync,
          status: t.sync.status,
          count: t.sync.count,
        }} />

        <section>
          <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800 mb-2">{t.dashboard.stageDistribution}</h2>
          <div className="rounded-lg border border-line bg-surface p-5 flex flex-wrap gap-3 sm:gap-4">
            {(Object.entries(stageCounts) as [string, number][]).map(([stage, count]) => (
              <div key={stage} className="flex items-center gap-2">
                <StatusPill label={stage} lang={lang} />
                <span className="text-[13px] font-semibold text-ink-800 tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
