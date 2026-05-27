import { Topbar } from "@/components/admin/Topbar";
import { StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusPill } from "@/components/admin/StatusPill";
import { TopicTag } from "@/components/admin/TopicTag";
import { TopicHeatMatrix } from "@/components/admin/charts/TopicHeatMatrix";
import { VendorTopicGrid } from "@/components/admin/charts/VendorTopicGrid";
import { TechTrendChart } from "@/components/admin/charts/TechTrendChart";

import { listProducts } from "@/lib/admin/products";
import { listVendors } from "@/lib/admin/vendors";
import { listOpenSource } from "@/lib/admin/opensource";
import { listConferences } from "@/lib/admin/conferences";
import { listPapers } from "@/lib/admin/papers";
import { listLeads } from "@/lib/admin/leads";
import { aggregateTopicMatrix, buildVendorTopicMap, getTopicMonthlyTrend } from "@/lib/admin/ecosystem-stats";
import { getDict } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type TimelineEvent = {
  type: "conference" | "paper" | "product" | "vendor" | "news" | "lead";
  date: string;
  title: string;
  href: string;
};

const EVENT_DOT_COLORS: Record<TimelineEvent["type"], string> = {
  conference: "bg-violet-500",
  paper: "bg-blue-500",
  product: "bg-amber-500",
  vendor: "bg-emerald-500",
  news: "bg-cyan-500",
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

function MiniBar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-ink-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color ?? "var(--color-navy-500)" }}
        />
      </div>
      <span className="font-mono text-[11px] tabular-nums text-ink-600 w-6 text-right">{value}</span>
    </div>
  );
}

export default async function EcosystemPage() {
  const { lang, t } = await getDict();
  const supabase = await createClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [confResult, paperResult, osResult, productResult, vendorResult, leadResult, talentCount, newsCount] = await Promise.all([
    listConferences({ page: 1, pageSize: 100 }),
    listPapers({ page: 1, pageSize: 100 }),
    listOpenSource({ page: 1, pageSize: 100 }),
    listProducts({ page: 1, pageSize: 100 }),
    listVendors({ page: 1, pageSize: 100 }),
    listLeads({ page: 1, pageSize: 100 }),
    supabase.from("talent_leads").select("*", { count: "exact", head: true }),
    supabase.from("news_items").select("*", { count: "exact", head: true }),
  ]);

  const products = productResult.data;
  const vendors = vendorResult.data;
  const opensource = osResult.data;
  const conferences = confResult.data;
  const papers = paperResult.data;
  const leads = leadResult.data;

  const topicMatrix = aggregateTopicMatrix(papers, conferences, products, opensource, vendors);
  const vendorTopicMap = buildVendorTopicMap(vendors, products);

  // Trend: fetch all papers with dates (paginated to avoid Supabase 1k cap)
  const trendPageSize = 1000;
  const trendPapers: { published_date: string; topics: string[] }[] = [];
  for (let offset = 0; ; offset += trendPageSize) {
    const { data: page } = await supabase
      .from("papers")
      .select("published_date, paper_topics(topic_slug)")
      .not("published_date", "is", null)
      .order("published_date", { ascending: false })
      .range(offset, offset + trendPageSize - 1);
    if (!page || page.length === 0) break;
    for (const r of page) {
      trendPapers.push({
        published_date: r.published_date,
        topics: (r.paper_topics ?? []).map((pt: any) => pt.topic_slug),
      });
    }
    if (page.length < trendPageSize) break;
  }
  const trendData = getTopicMonthlyTrend(trendPapers, 8);
  const trendTopicKeys = trendData.length > 0
    ? Object.keys(trendData[0]).filter((k) => k !== "period")
    : [];

  // Timeline
  const timeline: TimelineEvent[] = [
    ...conferences
      .filter((c) => c.start_date >= thirtyDaysAgo.slice(0, 10))
      .map((c) => ({ type: "conference" as const, date: c.start_date, title: c.name, href: `/admin/conferences/${c.id}` })),
    ...papers
      .filter((p) => p.created_at >= thirtyDaysAgo)
      .map((p) => ({ type: "paper" as const, date: p.created_at.slice(0, 10), title: p.title, href: p.url || `/admin/papers` })),
    ...products
      .filter((p) => p.release_date && p.release_date >= thirtyDaysAgo.slice(0, 10))
      .map((p) => ({ type: "product" as const, date: p.release_date!, title: `${p.name} ${p.latest_version ?? ""}`.trim(), href: `/admin/products/${p.id}` })),
    ...vendors
      .filter((v) => v.created_at >= thirtyDaysAgo)
      .map((v) => ({ type: "vendor" as const, date: v.created_at.slice(0, 10), title: v.name, href: `/admin/vendors/${v.id}` })),
    ...leads
      .filter((l) => l.created_at >= thirtyDaysAgo)
      .map((l) => ({ type: "lead" as const, date: l.created_at.slice(0, 10), title: l.title, href: `/admin/leads/${l.id}` })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);

  // Topic coverage
  const allTopics = Array.from(new Set([
    ...products.flatMap((p) => p.topics),
    ...vendors.flatMap((v) => v.topics),
    ...opensource.flatMap((o) => o.topics),
  ])).sort();

  const topicCounts = allTopics.map((topic) => ({
    topic,
    products: products.filter((p) => p.topics.includes(topic)).length,
    vendors: vendors.filter((v) => v.topics.includes(topic)).length,
    opensource: opensource.filter((o) => o.topics.includes(topic)).length,
  })).sort((a, b) => (b.products + b.vendors + b.opensource) - (a.products + a.vendors + a.opensource));

  const maxTopicTotal = Math.max(1, ...topicCounts.map((t) => t.products + t.vendors + t.opensource));

  const recentProducts = [...products]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5);

  const recentVendors = [...vendors]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5);

  const vendorMatrix = vendors
    .filter((v) => v.stage !== "archived")
    .map((v) => ({ vendor: v, products: products.filter((p) => p.vendor === v.name) }))
    .filter((g) => g.products.length > 0);

  const EVENT_LABEL: Record<TimelineEvent["type"], string> = {
    conference: t.ecosystem.conferences,
    paper: t.ecosystem.papers,
    product: t.ecosystem.products,
    vendor: t.ecosystem.vendors,
    news: t.ecosystem.news,
    lead: t.ecosystem.leads,
  };

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.ecosystem }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10 max-w-[1440px] mx-auto">
        <header className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">{t.ecosystem.title}</p>
          <p className="mt-3 max-w-2xl text-[13px] text-ink-500 leading-relaxed">{t.ecosystem.description}</p>
        </header>

        {/* Overview stats */}
        <section className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line rounded-lg overflow-hidden border border-line">
            <StatCard label={t.ecosystem.conferences} value={confResult.total} sub={t.dashboard.recorded} />
            <StatCard label={t.ecosystem.papers} value={paperResult.total} sub={t.dashboard.recorded} />
            <StatCard label={t.dashboard.opensource} value={osResult.total} sub={t.dashboard.tracking} />
            <StatCard label={t.ecosystem.products} value={productResult.total} sub={t.dashboard.tracking} />
            <StatCard label={t.ecosystem.vendors} value={vendorResult.total} sub={t.dashboard.tracking} />
            <StatCard label={t.ecosystem.talents} value={talentCount.count ?? 0} sub={t.dashboard.recorded} />
            <StatCard label={t.ecosystem.leads} value={leadResult.total} sub={t.dashboard.tracking} />
            <StatCard label={t.ecosystem.news} value={newsCount.count ?? 0} sub={t.dashboard.recorded} />
          </div>
        </section>

        {/* Topic Intelligence */}
        <div className="space-y-6 mb-10">
          <SectionCard title={t.ecosystem.topicHeatMatrix}>
            {topicMatrix.length > 0 ? (
              <TopicHeatMatrix data={topicMatrix} lang={lang} />
            ) : (
              <EmptyState title={t.topics.noTopics} description={t.topics.noTopicsDesc} compact />
            )}
          </SectionCard>

          <SectionCard title={t.ecosystem.techTrend}>
            {trendData.length > 0 ? (
              <TechTrendChart data={trendData} topicKeys={trendTopicKeys} lang={lang} />
            ) : (
              <EmptyState title={t.ecosystem.noEvents} description={t.ecosystem.noEventsDesc} compact />
            )}
          </SectionCard>
        </div>

        <SectionCard title={t.ecosystem.vendorTopicLayout}>
          {vendorTopicMap.length > 0 ? (
            <VendorTopicGrid data={vendorTopicMap} lang={lang} />
          ) : (
            <EmptyState title={t.empty.vendors} description={t.empty.vendorsDesc} compact />
          )}
        </SectionCard>

        {/* Recent Activity — Timeline */}
        <SectionCard title={t.ecosystem.timeline}>
          {timeline.length === 0 ? (
            <EmptyState title={t.ecosystem.noEvents} description={t.ecosystem.noEventsDesc} compact />
          ) : (
            <div className="space-y-1">
              {timeline.map((ev, i) => (
                <Link
                  key={`${ev.type}-${ev.date}-${i}`}
                  href={ev.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-paper/40 transition-colors min-h-[44px] group"
                >
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

        {/* Recent Updates */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <SectionCard title={`${t.ecosystem.recentUpdates} — ${t.ecosystem.products}`}>
            {recentProducts.length === 0 ? (
              <EmptyState title={t.empty.products} description={t.empty.productsDesc} compact />
            ) : (
              <div className="space-y-0.5">
                {recentProducts.map((p) => (
                  <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-paper/40 transition-colors min-h-[44px] group">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-ink-800 truncate group-hover:text-navy-600 transition-colors">{p.name}</p>
                      <p className="text-[11px] text-ink-400 mt-0.5">
                        {p.vendor ?? "—"}{p.latest_version && <> · <span className="font-mono">{p.latest_version}</span></>}
                      </p>
                    </div>
                    <StatusPill label={p.stage} lang={lang} />
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-2 text-center">
              <Link href="/admin/products" className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-500 hover:text-navy-700 transition-colors">{t.dashboard.viewAll}</Link>
            </div>
          </SectionCard>

          <SectionCard title={`${t.ecosystem.recentUpdates} — ${t.ecosystem.vendors}`}>
            {recentVendors.length === 0 ? (
              <EmptyState title={t.empty.vendors} description={t.empty.vendorsDesc} compact />
            ) : (
              <div className="space-y-0.5">
                {recentVendors.map((v) => (
                  <Link key={v.id} href={`/admin/vendors/${v.id}`} className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-paper/40 transition-colors min-h-[44px] group">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-ink-800 truncate group-hover:text-navy-600 transition-colors">{v.name}</p>
                      <p className="text-[11px] text-ink-400 mt-0.5">{v.hq_location ?? "—"}</p>
                    </div>
                    <StatusPill label={v.stage} lang={lang} />
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-2 text-center">
              <Link href="/admin/vendors" className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-500 hover:text-navy-700 transition-colors">{t.dashboard.viewAll}</Link>
            </div>
          </SectionCard>
        </div>

        {/* Topic Coverage */}
        <SectionCard title={t.ecosystem.topicCoverage}>
          {topicCounts.length === 0 ? (
            <EmptyState title={t.topics.noTopics} description={t.topics.noTopicsDesc} compact />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.topics}</th>
                    <th className="pb-3 px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.ecosystem.products}</th>
                    <th className="pb-3 px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.ecosystem.vendors}</th>
                    <th className="pb-3 pl-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.ecosystem.opensource}</th>
                  </tr>
                </thead>
                <tbody>
                  {topicCounts.slice(0, 20).map((tc) => (
                    <tr key={tc.topic} className="border-t border-line">
                      <td className="py-2.5 pr-4"><TopicTag label={tc.topic} lang={lang} /></td>
                      <td className="py-2.5 px-4 w-[140px]"><MiniBar value={tc.products} max={maxTopicTotal} color="#818cf8" /></td>
                      <td className="py-2.5 px-4 w-[140px]"><MiniBar value={tc.vendors} max={maxTopicTotal} color="#34d399" /></td>
                      <td className="py-2.5 pl-4 w-[140px]"><MiniBar value={tc.opensource} max={maxTopicTotal} color="#fbbf24" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* Vendor-Product Matrix */}
        {vendorMatrix.length > 0 && (
          <div className="mt-6">
            <SectionCard title={t.ecosystem.vendorProductMatrix}>
              <div className="space-y-4">
                {vendorMatrix.map((g) => (
                  <div key={g.vendor.id} className="rounded-lg border border-line bg-paper/30 overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-3 border-b border-line">
                      <Link href={`/admin/vendors/${g.vendor.id}`} className="text-[13px] font-medium text-ink-800 hover:text-navy-600 transition-colors">{g.vendor.name}</Link>
                      <StatusPill label={g.vendor.stage} lang={lang} />
                      <span className="font-mono text-[10px] text-ink-400 ml-auto">{g.products.length} products</span>
                    </div>
                    <div className="divide-y divide-line">
                      {g.products.map((p) => (
                        <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-paper/40 transition-colors min-h-[40px] group">
                          <span className="text-[13px] text-ink-700 truncate flex-1 group-hover:text-navy-600 transition-colors">{p.name}</span>
                          {p.latest_version && <span className="font-mono text-[10px] text-ink-400">{p.latest_version}</span>}
                          <StatusPill label={p.stage} lang={lang} />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}
      </main>
    </>
  );
}
