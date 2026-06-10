import { Topbar } from "@/components/admin/Topbar";
import { StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { VendorIntelligenceGrid } from "@/components/admin/charts/VendorIntelligenceGrid";
import { TechTrendChart } from "@/components/admin/charts/TechTrendChart";
import { Watchlist } from "@/components/admin/Watchlist";

import { listProducts } from "@/lib/admin/products";
import { listVendors } from "@/lib/admin/vendors";
import { listOpenSource } from "@/lib/admin/opensource";
import { listConferences } from "@/lib/admin/conferences";
import { listPapers } from "@/lib/admin/papers";
import { listLeads } from "@/lib/admin/leads";
import { getTopicMonthlyTrend } from "@/lib/admin/ecosystem-stats";
import { getDict } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type TimelineEvent = {
  type: "conference" | "paper" | "product" | "lead";
  date: string;
  title: string;
  href: string;
};

const EVENT_DOT_COLORS: Record<TimelineEvent["type"], string> = {
  conference: "bg-violet-500", paper: "bg-blue-500", product: "bg-amber-500",
  lead: "bg-rose-500",
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-surface overflow-hidden">
      <div className="px-5 py-3.5 border-b border-line bg-paper/30">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{title}</h3>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export default async function DashboardPage() {
  const { lang, t } = await getDict();
  const supabase = await createClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [confResult, paperResult, osResult, productResult, vendorResult, leadResult, talentCount, newsCount, trendPage0, trendPage1, trendPage2, trendPage3, vendorIntel] = await Promise.all([
    listConferences({ page: 1, pageSize: 100 }),
    listPapers({ page: 1, pageSize: 100 }),
    listOpenSource({ page: 1, pageSize: 100 }),
    listProducts({ page: 1, pageSize: 100 }),
    listVendors({ page: 1, pageSize: 100 }),
    listLeads({ page: 1, pageSize: 100 }),
    supabase.from("talent_leads").select("*", { count: "exact", head: true }),
    supabase.from("news_items").select("*", { count: "exact", head: true }),
    supabase.from("papers")
      .select("published_date, paper_topics(topic_slug)").not("published_date", "is", null)
      .order("published_date", { ascending: false }).range(0, 999),
    supabase.from("papers")
      .select("published_date, paper_topics(topic_slug)").not("published_date", "is", null)
      .order("published_date", { ascending: false }).range(1000, 1999),
    supabase.from("papers")
      .select("published_date, paper_topics(topic_slug)").not("published_date", "is", null)
      .order("published_date", { ascending: false }).range(2000, 2999),
    supabase.from("papers")
      .select("published_date, paper_topics(topic_slug)").not("published_date", "is", null)
      .order("published_date", { ascending: false }).range(3000, 3999),
    supabase.from("vendors").select("id, name, topics, ai_insights, paper_count, product_count, news_count").not("name", "is", null).order("paper_count", { ascending: false }),
  ]);

  const products = productResult.data;
  const vendors = vendorResult.data;
  const opensource = osResult.data;
  const conferences = confResult.data;
  const papers = paperResult.data;
  const leads = leadResult.data;

  const vendorIntelData = (vendorIntel.data ?? []).filter((v: any) => v.name);

  const trendPapers = [...(trendPage0.data ?? []), ...(trendPage1.data ?? []), ...(trendPage2.data ?? []), ...(trendPage3.data ?? [])]
    .filter((r: any) => r.published_date && r.published_date >= "2026-03-01")
    .map((r: any) => ({
      published_date: r.published_date,
      topics: (r.paper_topics ?? []).map((pt: any) => pt.topic_slug),
    }));
  const trendData = getTopicMonthlyTrend(trendPapers, 8);
  const trendTopicKeys = trendData.length > 0
    ? Object.keys(trendData[0]).filter((k) => k !== "period")
    : [];

  const timeline: TimelineEvent[] = [
    ...conferences.filter((c) => c.start_date >= thirtyDaysAgo.slice(0, 10))
      .map((c) => ({ type: "conference" as const, date: c.start_date, title: c.name, href: `/admin/conferences/${c.id}` })),
    ...papers.filter((p) => p.created_at >= thirtyDaysAgo)
      .map((p) => ({ type: "paper" as const, date: p.created_at.slice(0, 10), title: p.title, href: p.url || `/admin/papers` })),
    ...products.filter((p) => p.release_date && p.release_date >= thirtyDaysAgo.slice(0, 10))
      .map((p) => ({ type: "product" as const, date: p.release_date!, title: `${p.name} ${p.latest_version ?? ""}`.trim(), href: `/admin/products/${p.id}` })),
    ...leads.filter((l) => l.created_at >= thirtyDaysAgo)
      .map((l) => ({ type: "lead" as const, date: l.created_at.slice(0, 10), title: l.title, href: `/admin/leads/${l.id}` })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15);

  const EVENT_LABEL: Record<string, string> = {
    conference: t.ecosystem.conferences, paper: t.ecosystem.papers, product: t.ecosystem.products,
    lead: t.ecosystem.leads,
  };

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10 max-w-[1200px] mx-auto">
        <header className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">{t.nav.dashboard}</p>
          <p className="mt-3 max-w-2xl text-[13px] text-ink-500 leading-relaxed">{t.dashboard.description}</p>
        </header>

        {/* Overview stats */}
        <section className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line rounded-lg overflow-hidden border border-line">
            <StatCard label={t.ecosystem.conferences} value={confResult.total} sub={t.dashboard.recorded} />
            <StatCard label={t.ecosystem.papers} value={paperResult.total} sub={t.dashboard.recorded} />
            <StatCard label={t.dashboard.opensource} value={osResult.total} sub={t.dashboard.tracking} />
            <StatCard label={t.ecosystem.products} value={productResult.total} sub={t.dashboard.tracking} />
            <StatCard label={t.ecosystem.vendors} value={vendorResult.total} sub={t.dashboard.tracking} />
            <StatCard label={t.ecosystem.leads} value={leadResult.total} sub={t.dashboard.tracking} />
            <StatCard label={t.ecosystem.talents} value={talentCount.count ?? 0} sub={t.dashboard.recorded} />
            <StatCard label={t.ecosystem.news} value={newsCount.count ?? 0} sub={t.dashboard.recorded} />
          </div>
        </section>

        {/* Tech Trend */}
        <SectionCard title={t.ecosystem.techTrend}>
          {trendData.length > 0 ? (
            <TechTrendChart data={trendData} topicKeys={trendTopicKeys} lang={lang} />
          ) : (
            <EmptyState title={t.ecosystem.noEvents} description={t.ecosystem.noEventsDesc} compact />
          )}
        </SectionCard>

        {/* Vendor intelligence */}
        <div className="mt-6">
          <SectionCard title={t.ecosystem.vendorTopicLayout}>
            {vendorIntelData.length > 0 ? (
              <VendorIntelligenceGrid data={vendorIntelData} lang={lang} />
            ) : (
              <EmptyState title={t.empty.vendors} description={t.empty.vendorsDesc} compact />
            )}
          </SectionCard>
        </div>

        {/* Timeline + Watchlist */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <SectionCard title={t.ecosystem.timeline}>
            {timeline.length === 0 ? (
              <EmptyState title={t.ecosystem.noEvents} description={t.ecosystem.noEventsDesc} compact />
            ) : (
              <div className="space-y-1">
                {timeline.map((ev, i) => (
                  <Link key={`${ev.type}-${ev.date}-${i}`} href={ev.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-paper/40 transition-colors min-h-[44px] group">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${EVENT_DOT_COLORS[ev.type]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-ink-800 truncate group-hover:text-navy-600 transition-colors">{ev.title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] text-ink-400">{ev.date}</span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded">{EVENT_LABEL[ev.type]}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>

          <Watchlist labels={{
            watchlist: t.favorite.watchlist,
            noFavorites: t.favorite.noFavorites,
            noFavoritesDesc: t.favorite.noFavoritesDesc,
            entityLabels: {
              conferences: t.nav.conferences, papers: t.nav.papers, leads: t.nav.leads,
              talents: t.nav.talents, opensource: t.nav.opensource, news: t.nav.news,
              jobs: t.nav.jobs, products: t.nav.products, vendors: t.nav.vendors,
            },
          }} />
        </div>
      </main>
    </>
  );
}
