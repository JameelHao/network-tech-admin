import { Topbar } from "@/components/admin/Topbar";
import { StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusPill } from "@/components/admin/StatusPill";
import { TopicTag } from "@/components/admin/TopicTag";
import { TopicHeatMatrix } from "@/components/admin/charts/TopicHeatMatrix";
import { VendorTopicGrid } from "@/components/admin/charts/VendorTopicGrid";
import { TechTrendChart } from "@/components/admin/charts/TechTrendChart";
import { OpenSourceBubble } from "@/components/admin/charts/OpenSourceBubble";
import { listProducts } from "@/lib/admin/products";
import { listVendors } from "@/lib/admin/vendors";
import { listOpenSource } from "@/lib/admin/opensource";
import { listConferences } from "@/lib/admin/conferences";
import { listPapers } from "@/lib/admin/papers";
import { listLeads } from "@/lib/admin/leads";
import { aggregateTopicMatrix, buildVendorTopicMap, getTopicQuarterlyTrend, buildOpenSourceBubbles } from "@/lib/admin/ecosystem-stats";
import { getDict } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type TimelineEvent = {
  type: "conference" | "paper" | "product" | "vendor" | "news" | "lead";
  date: string;
  title: string;
  href: string;
};

const EVENT_ICONS: Record<TimelineEvent["type"], string> = {
  conference: "🏛️",
  paper: "📄",
  product: "🚀",
  vendor: "🏢",
  news: "📰",
  lead: "🔗",
};

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

  // New: aggregation data for enhanced modules
  const topicMatrix = aggregateTopicMatrix(papers, conferences, products, opensource, vendors);
  const vendorTopicMap = buildVendorTopicMap(vendors, products);
  const trendData = getTopicQuarterlyTrend(papers);
  const trendTopicKeys = trendData.length > 0
    ? Object.keys(trendData[0]).filter((k) => k !== "quarter")
    : [];
  const bubbleData = buildOpenSourceBubbles(opensource);

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

  // Topic coverage (original)
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

  // Recent updates
  const recentProducts = [...products]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5);

  const recentVendors = [...vendors]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5);

  // Vendor-Product matrix (original)
  const vendorMatrix = vendors
    .filter((v) => v.stage !== "archived")
    .map((v) => ({ vendor: v, products: products.filter((p) => p.vendor === v.name) }))
    .filter((g) => g.products.length > 0);

  const EVENT_LABEL_MAP: Record<TimelineEvent["type"], string> = {
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
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10 space-y-6 sm:space-y-8">
        <h1 className="font-sans text-[15px] font-semibold tracking-tight text-ink-800">{t.ecosystem.title}</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line rounded-lg overflow-hidden border border-line">
          <StatCard label={t.ecosystem.conferences} value={confResult.total} sub={t.dashboard.recorded} />
          <StatCard label={t.ecosystem.papers} value={paperResult.total} sub={t.dashboard.recorded} />
          <StatCard label={t.dashboard.opensource} value={osResult.total} sub={t.dashboard.tracking} />
          <StatCard label={t.ecosystem.products} value={productResult.total} sub={t.dashboard.tracking} />
          <StatCard label={t.ecosystem.vendors} value={vendorResult.total} sub={t.dashboard.tracking} />
          <StatCard label={t.ecosystem.talents} value={talentCount.count ?? 0} sub={t.dashboard.recorded} />
          <StatCard label={t.ecosystem.leads} value={leadResult.total} sub={t.dashboard.tracking} />
          <StatCard label={t.ecosystem.news} value={newsCount.count ?? 0} sub={t.dashboard.recorded} />
        </div>

        {/* Topic Heat Matrix */}
        <section>
          <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800 mb-2">{t.ecosystem.topicHeatMatrix}</h2>
          <div className="rounded-lg border border-line bg-surface p-4">
            {topicMatrix.length > 0 ? (
              <TopicHeatMatrix data={topicMatrix} lang={lang} />
            ) : (
              <EmptyState title={t.topics.noTopics} description={t.topics.noTopicsDesc} compact />
            )}
          </div>
        </section>

        {/* Vendor-Topic Layout */}
        <section>
          <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800 mb-2">{t.ecosystem.vendorTopicLayout}</h2>
          <div className="rounded-lg border border-line bg-surface p-4">
            {vendorTopicMap.length > 0 ? (
              <VendorTopicGrid data={vendorTopicMap} lang={lang} />
            ) : (
              <EmptyState title={t.empty.vendors} description={t.empty.vendorsDesc} compact />
            )}
          </div>
        </section>

        {/* Tech Trend Chart */}
        <section>
          <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800 mb-2">{t.ecosystem.techTrend}</h2>
          <div className="rounded-lg border border-line bg-surface p-4">
            {trendData.length > 0 ? (
              <TechTrendChart data={trendData} topicKeys={trendTopicKeys} lang={lang} />
            ) : (
              <EmptyState title={t.ecosystem.noEvents} description={t.ecosystem.noEventsDesc} compact />
            )}
          </div>
        </section>

        {/* Open Source Bubble Chart */}
        <section>
          <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800 mb-2">{t.ecosystem.openSourceBubble}</h2>
          <div className="rounded-lg border border-line bg-surface p-4">
            {bubbleData.length > 0 ? (
              <OpenSourceBubble data={bubbleData} lang={lang} />
            ) : (
              <EmptyState title={t.empty.opensource} description={t.empty.opensourceDesc} compact />
            )}
          </div>
        </section>

        <section>
          <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800 mb-2">{t.ecosystem.timeline}</h2>
          <div className="rounded-lg border border-line bg-surface divide-y divide-line">
            {timeline.length === 0 && (
              <EmptyState title={t.ecosystem.noEvents} description={t.ecosystem.noEventsDesc} compact />
            )}
            {timeline.map((ev, i) => (
              <Link key={`${ev.type}-${ev.date}-${i}`} href={ev.href} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-paper/40 transition-colors min-h-[44px]">
                <span className="text-[16px] shrink-0">{EVENT_ICONS[ev.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-ink-800 truncate">{ev.title}</p>
                  <p className="text-[11px] text-ink-400 mt-0.5">
                    <span className="font-mono">{ev.date}</span> · {EVENT_LABEL_MAP[ev.type]}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800">{t.ecosystem.recentUpdates} — {t.ecosystem.products}</h2>
              <Link href="/admin/products" className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-500 hover:text-navy-700 transition-colors">{t.dashboard.viewAll}</Link>
            </div>
            <div className="rounded-lg border border-line bg-surface divide-y divide-line">
              {recentProducts.length === 0 && (
                <EmptyState title={t.empty.products} description={t.empty.productsDesc} compact />
              )}
              {recentProducts.map((p) => (
                <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center gap-4 px-4 sm:px-5 py-3.5 hover:bg-paper/40 transition-colors min-h-[44px]">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink-800 truncate">{p.name}</p>
                    <p className="text-[12px] text-ink-400 mt-0.5">
                      {p.vendor ?? "—"}{p.latest_version && <> · <span className="font-mono">{p.latest_version}</span></>}
                    </p>
                  </div>
                  <StatusPill label={p.stage} lang={lang} />
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800">{t.ecosystem.recentUpdates} — {t.ecosystem.vendors}</h2>
              <Link href="/admin/vendors" className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-500 hover:text-navy-700 transition-colors">{t.dashboard.viewAll}</Link>
            </div>
            <div className="rounded-lg border border-line bg-surface divide-y divide-line">
              {recentVendors.length === 0 && (
                <EmptyState title={t.empty.vendors} description={t.empty.vendorsDesc} compact />
              )}
              {recentVendors.map((v) => (
                <Link key={v.id} href={`/admin/vendors/${v.id}`} className="flex items-center gap-4 px-4 sm:px-5 py-3.5 hover:bg-paper/40 transition-colors min-h-[44px]">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink-800 truncate">{v.name}</p>
                    <p className="text-[12px] text-ink-400 mt-0.5">{v.hq_location ?? "—"}</p>
                  </div>
                  <StatusPill label={v.stage} lang={lang} />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <section>
          <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800 mb-2">{t.ecosystem.topicCoverage}</h2>
          <div className="rounded-lg border border-line bg-surface overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line bg-paper/30 text-left">
                  <th className="px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.topics}</th>
                  <th className="px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.ecosystem.products}</th>
                  <th className="px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.ecosystem.vendors}</th>
                  <th className="px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.ecosystem.opensource}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {topicCounts.length === 0 && (
                  <tr><td colSpan={4}>
                    <EmptyState title={t.topics.noTopics} description={t.topics.noTopicsDesc} compact />
                  </td></tr>
                )}
                {topicCounts.slice(0, 20).map((tc) => (
                  <tr key={tc.topic} className="hover:bg-paper/40 transition-colors">
                    <td className="px-3 sm:px-5 py-2.5"><TopicTag label={tc.topic} lang={lang} /></td>
                    <td className="px-3 sm:px-5 py-2.5 tabular-nums text-ink-600">{tc.products}</td>
                    <td className="px-3 sm:px-5 py-2.5 tabular-nums text-ink-600">{tc.vendors}</td>
                    <td className="px-3 sm:px-5 py-2.5 tabular-nums text-ink-600">{tc.opensource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {vendorMatrix.length > 0 && (
          <section>
            <h2 className="font-sans text-[13px] font-semibold tracking-tight text-ink-800 mb-2">{t.ecosystem.vendorProductMatrix}</h2>
            <div className="space-y-3">
              {vendorMatrix.map((g) => (
                <div key={g.vendor.id} className="rounded-lg border border-line bg-surface">
                  <div className="px-4 sm:px-5 py-3 border-b border-line flex items-center gap-3">
                    <Link href={`/admin/vendors/${g.vendor.id}`} className="text-[13px] font-medium text-ink-800 hover:text-navy-600 transition-colors">{g.vendor.name}</Link>
                    <StatusPill label={g.vendor.stage} lang={lang} />
                    <span className="font-mono text-[11px] text-ink-400">{g.products.length}</span>
                  </div>
                  <div className="divide-y divide-line">
                    {g.products.map((p) => (
                      <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center gap-3 px-4 sm:px-5 py-2.5 hover:bg-paper/40 transition-colors min-h-[40px]">
                        <span className="text-[13px] text-ink-700 truncate flex-1">{p.name}</span>
                        {p.latest_version && <span className="font-mono text-[11px] text-ink-400">{p.latest_version}</span>}
                        <StatusPill label={p.stage} lang={lang} />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
