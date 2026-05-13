import { Topbar } from "@/components/admin/Topbar";
import { StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusPill } from "@/components/admin/StatusPill";
import { TopicTag } from "@/components/admin/TopicTag";
import { listProducts } from "@/lib/admin/products";
import { listVendors } from "@/lib/admin/vendors";
import { listOpenSource } from "@/lib/admin/opensource";
import { getDict } from "@/lib/i18n/server";
import Link from "next/link";

export default async function EcosystemPage() {
  const { lang, t } = await getDict();
  const [productResult, vendorResult, osResult] = await Promise.all([
    listProducts({ pageSize: 100 }),
    listVendors({ pageSize: 100 }),
    listOpenSource({ pageSize: 100 }),
  ]);

  const products = productResult.data;
  const vendors = vendorResult.data;
  const opensource = osResult.data;

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

  const recentProducts = [...products]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5);

  const recentVendors = [...vendors]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5);

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.ecosystem }]} t={t} lang={lang} />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10 space-y-6 sm:space-y-8">
        <h1 className="font-sans text-[15px] font-semibold tracking-tight text-ink-800">{t.ecosystem.title}</h1>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-line rounded-lg overflow-hidden border border-line">
          <StatCard label={t.ecosystem.products} value={productResult.total} sub={t.dashboard.tracking} />
          <StatCard label={t.ecosystem.vendors} value={vendorResult.total} sub={t.dashboard.tracking} />
          <StatCard label={t.dashboard.opensource} value={osResult.total} sub={t.dashboard.tracking} />
        </div>

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
                  <th className="px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.dashboard.opensource}</th>
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
      </main>
    </>
  );
}
