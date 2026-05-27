import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/Topbar";
import { EmptyState } from "@/components/admin/EmptyState";
import { ExportButton } from "@/components/admin/ExportButton";
import { Pagination } from "@/components/admin/Pagination";
import { ProductsTableWithModal } from "@/components/admin/ProductsTableWithModal";
import { NewProductModal } from "@/components/admin/NewProductModal";
import { listProducts } from "@/lib/admin/products";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { OverflowMenu } from "@/components/admin/OverflowMenu";
import { SyncStatusBar } from "@/components/admin/SyncStatusBar";
import { getDict } from "@/lib/i18n/server";
import { PRODUCT_CATEGORIES } from "@/lib/admin/types";
import Link from "next/link";
import type { SortDir } from "@/lib/admin/pagination";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp);
  const filterCategory = typeof sp.category === "string" ? sp.category : undefined;
  const filterVendor = typeof sp.vendor === "string" ? sp.vendor : undefined;
  const filterKeyword = typeof sp.keyword === "string" ? sp.keyword : undefined;
  const filterTopic = typeof sp.topic === "string" ? sp.topic : undefined;
  const showFilter = sp.showFilter === "1";
  const sortCol = typeof sp.sort === "string" ? sp.sort : undefined;
  const sortDir = typeof sp.dir === "string" ? sp.dir as SortDir : undefined;

  const result = await listProducts(params, {
    category: filterCategory,
    vendor: filterVendor,
    keyword: filterKeyword,
    topic: filterTopic,
  });
  const products = result.data;

  const supabase = await createClient();
  const [{ data: vendorRows }, { data: topicRows }] = await Promise.all([
    supabase.from("products").select("vendor").not("vendor", "is", null),
    supabase.from("products").select("topics").not("topics", "is", null),
  ]);
  const allVendors = [...new Set(vendorRows?.map((v: any) => v.vendor) ?? [])].sort() as string[];
  const allTopics = [...new Set(topicRows?.flatMap((t: any) => t.topics ?? []) ?? [])].sort() as string[];

  const filterParams: Record<string, string> = {};
  if (filterCategory) filterParams.category = filterCategory;
  if (filterVendor) filterParams.vendor = filterVendor;
  if (filterKeyword) filterParams.keyword = filterKeyword;
  if (filterTopic) filterParams.topic = filterTopic;
  if (sortCol && sortDir) { filterParams.sort = sortCol; filterParams.dir = sortDir; }

  const filterParamsStr = new URLSearchParams(filterParams).toString();
  const collapseHref = filterParamsStr ? `/admin/products?${filterParamsStr}` : "/admin/products";

  const activeFilters: { label: string; value: string }[] = [];
  if (filterCategory) activeFilters.push({ label: t.product.category, value: filterCategory });
  if (filterVendor) activeFilters.push({ label: t.vendor.title, value: filterVendor });
  if (filterKeyword) activeFilters.push({ label: t.common.name, value: filterKeyword });
  if (filterTopic) activeFilters.push({ label: t.common.topics, value: filterTopic });

  const clearParams = new URLSearchParams();
  if (sortCol && sortDir) { clearParams.set("sort", sortCol); clearParams.set("dir", sortDir); }
  const clearHref = clearParams.toString() ? `/admin/products?${clearParams.toString()}` : "/admin/products";

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.products }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
            {t.nav.products}
          </p>
          <p className="mt-4 max-w-2xl text-[13.5px] text-ink-500">
            {t.product.description}
          </p>
        </header>

        <SyncStatusBar entity="products" lang={lang} labels={{ lastSync: t.sync.lastSync, refresh: t.sync.refresh, refreshing: t.sync.refreshing, noData: t.sync.noData, syncResult: t.sync.syncResult, sourcesFailed: t.sync.sourcesFailed }} />

        <section data-fav-filter="products" className="rounded-lg border border-line bg-surface overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line bg-paper/30">
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={showFilter ? collapseHref : `/admin/products?showFilter=1&${filterParamsStr}`}
                className={`rounded-md border px-2.5 py-1.5 text-[11px] font-mono transition-colors ${showFilter ? "bg-navy-50 border-navy-300 text-navy-600" : "border-line text-ink-500 hover:bg-paper/40"}`}
              >
                {lang === "zh" ? "筛选" : "Filter"}{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
              </Link>
              <div className="hidden lg:flex items-center gap-2">
                <ExportButton entity="products" format="csv" filters={filterParams} label={t.common.exportCSV} />
                <ExportButton entity="products" format="json" filters={filterParams} label={t.common.exportJSON} />
              </div>
              <OverflowMenu>
                <ExportButton entity="products" format="csv" filters={filterParams} label={t.common.exportCSV} />
                <ExportButton entity="products" format="json" filters={filterParams} label={t.common.exportJSON} />
              </OverflowMenu>
              <NewProductModal t={t} lang={lang} />
            </div>
          </header>

          {showFilter && (
            <div className="px-5 py-4 border-b border-line bg-paper/20 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mb-2">{t.product.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_CATEGORIES.map((cat) => {
                      const p = new URLSearchParams(filterParams);
                      p.delete("page");
                      if (p.get("category") === cat) p.delete("category");
                      else p.set("category", cat);
                      const href = p.toString() ? `/admin/products?${p.toString()}` : "/admin/products";
                      const active = filterCategory === cat;
                      return (
                        <Link key={cat} href={href} className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${active ? "bg-navy-50 border-navy-300 text-navy-600" : "border-line text-ink-500 hover:bg-paper/40"}`}>
                          {active && "✓ "}{t.product[cat as keyof typeof t.product] as string}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                {allVendors.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mb-2">{t.vendor.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {allVendors.map((v) => {
                      const p = new URLSearchParams(filterParams);
                      p.delete("page");
                      if (p.get("vendor") === v) p.delete("vendor");
                      else p.set("vendor", v);
                      const href = p.toString() ? `/admin/products?${p.toString()}` : "/admin/products";
                      const active = filterVendor === v;
                      return (
                        <Link key={v} href={href} className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${active ? "bg-navy-50 border-navy-300 text-navy-600" : "border-line text-ink-500 hover:bg-paper/40"}`}>
                          {active && "✓ "}{v}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                )}
              </div>
              {allTopics.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mb-2">{t.common.topics}</p>
                  <div className="flex flex-wrap gap-2">
                    {allTopics.map((topic) => {
                      const p = new URLSearchParams(filterParams);
                      p.delete("page");
                      if (p.get("topic") === topic) p.delete("topic");
                      else p.set("topic", topic);
                      const href = p.toString() ? `/admin/products?${p.toString()}` : "/admin/products";
                      const active = filterTopic === topic;
                      return (
                        <Link key={topic} href={href} className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${active ? "bg-navy-50 border-navy-300 text-navy-600" : "border-line text-ink-500 hover:bg-paper/40"}`}>
                          {active && "✓ "}{topic}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                {(filterCategory || filterKeyword || filterVendor || filterTopic) && (
                  <Link href={clearHref} className="text-[11px] font-mono text-ink-400 hover:text-ink-700 transition-colors">
                    ← {lang === "zh" ? "清除全部" : "Clear all"}
                  </Link>
                )}
                <Link href={collapseHref} className="text-[11px] font-mono text-ink-400 hover:text-ink-700 transition-colors">
                  {lang === "zh" ? "收起" : "Collapse"} ↑
                </Link>
              </div>
            </div>
          )}

          <FilterSummary filters={activeFilters} labels={{ activeFilters: t.filter.activeFilters, clearAll: t.filter.clearAll }} clearHref={clearHref} />

          <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper/30 text-left">
                <SortableHeader column="name" label={t.common.name} currentSort={sortCol} currentDir={sortDir} basePath="/admin/products" searchParams={filterParams} />
                <SortableHeader column="vendor" label={t.vendor.title} currentSort={sortCol} currentDir={sortDir} basePath="/admin/products" searchParams={filterParams} className="hidden lg:table-cell" />
                <SortableHeader column="category" label={t.product.category} currentSort={sortCol} currentDir={sortDir} basePath="/admin/products" searchParams={filterParams} />
                <SortableHeader column="published_at" label={t.product.releaseDate} currentSort={sortCol} currentDir={sortDir} basePath="/admin/products" searchParams={filterParams} />
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.topics}</th>
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">★</th>
              </tr>
            </thead>
            {products.length === 0 ? (
              <tbody className="divide-y divide-line">
                <tr><td colSpan={6}>
                  <EmptyState title={t.empty.products} description={t.empty.productsDesc} />
                </td></tr>
              </tbody>
            ) : (
              <ProductsTableWithModal products={products} t={t} lang={lang} />
            )}
          </table>
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            basePath="/admin/products"
            searchParams={filterParams}
            labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
          />
        </section>
      </main>
    </>
  );
}

