import { Topbar } from "@/components/admin/Topbar";
import { EmptyState } from "@/components/admin/EmptyState";
import { ExportButton } from "@/components/admin/ExportButton";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { FavoriteFilter } from "@/components/admin/FavoriteFilter";
import { Pagination } from "@/components/admin/Pagination";
import { StatusPill } from "@/components/admin/StatusPill";
import { TopicTag } from "@/components/admin/TopicTag";
import { listProducts } from "@/lib/admin/products";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { FilterSelect, FilterInput } from "@/components/admin/FilterControls";
import { MobileFilterPanel } from "@/components/admin/MobileFilterPanel";
import { OverflowMenu } from "@/components/admin/OverflowMenu";
import { SyncStatusBar } from "@/components/admin/SyncStatusBar";
import { getDict } from "@/lib/i18n/server";
import { computeProductStats } from "@/lib/admin/products-utils";
import { PRODUCT_CATEGORIES, PRODUCT_STAGES, PRODUCT_PRICING } from "@/lib/admin/types";
import Link from "next/link";
import type { SortDir } from "@/lib/admin/pagination";
import { tabClass } from "@/lib/admin/ui";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp);
  const filterCategory = typeof sp.category === "string" ? sp.category : undefined;
  const filterStage = typeof sp.stage === "string" ? sp.stage : undefined;
  const filterPricing = typeof sp.pricing === "string" ? sp.pricing : undefined;
  const filterVendor = typeof sp.vendor === "string" ? sp.vendor : undefined;
  const filterKeyword = typeof sp.keyword === "string" ? sp.keyword : undefined;
  const sortCol = typeof sp.sort === "string" ? sp.sort : undefined;
  const sortDir = typeof sp.dir === "string" ? sp.dir as SortDir : undefined;

  const result = await listProducts(params, {
    category: filterCategory,
    stage: filterStage,
    pricing: filterPricing,
    vendor: filterVendor,
    keyword: filterKeyword,
  });
  const products = result.data;

  const { usingCount, evaluatingCount, openSourceCount } = computeProductStats(products);

  const filterParams: Record<string, string> = {};
  if (filterCategory) filterParams.category = filterCategory;
  if (filterStage) filterParams.stage = filterStage;
  if (filterPricing) filterParams.pricing = filterPricing;
  if (filterVendor) filterParams.vendor = filterVendor;
  if (filterKeyword) filterParams.keyword = filterKeyword;
  if (sortCol && sortDir) { filterParams.sort = sortCol; filterParams.dir = sortDir; }

  const activeFilters: { label: string; value: string }[] = [];
  if (filterCategory) activeFilters.push({ label: t.product.category, value: filterCategory });
  if (filterStage) activeFilters.push({ label: t.common.stage, value: filterStage });
  if (filterPricing) activeFilters.push({ label: t.product.pricing, value: filterPricing });
  if (filterVendor) activeFilters.push({ label: t.vendor.title, value: filterVendor });
  if (filterKeyword) activeFilters.push({ label: t.common.name, value: filterKeyword });

  const clearParams = new URLSearchParams();
  if (sortCol && sortDir) { clearParams.set("sort", sortCol); clearParams.set("dir", sortDir); }
  const clearHref = clearParams.toString() ? `/admin/products?${clearParams.toString()}` : "/admin/products";

  const categoryOpts = PRODUCT_CATEGORIES.map((c) => ({ value: c, label: t.product[c as keyof typeof t.product] as string }));
  const pricingOpts = PRODUCT_PRICING.map((p) => ({ value: p, label: t.product[p === "open-source" ? "openSource" : p as keyof typeof t.product] as string }));

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

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">
          {t.product.overview}
        </p>
        <section className="mb-4 rounded-lg border border-line bg-surface overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            <Stat label={t.product.totalProducts} value={result.total} sub={t.product.totalSub} />
            <Stat label={t.product.usingProducts} value={usingCount} sub={t.product.usingSub} />
            <Stat label={t.product.evaluatingProducts} value={evaluatingCount} sub={t.product.evaluatingSub} />
            <Stat label={t.product.openSourceCount} value={openSourceCount} sub={t.product.openSourceSub} />
          </div>
        </section>

        <section data-fav-filter="products" className="rounded-lg border border-line bg-surface overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line bg-paper/30">
            <div className="hidden lg:flex flex-wrap items-center gap-1">
              {[undefined, ...PRODUCT_STAGES].map((s) => {
                const isActive = filterStage === s;
                const p = new URLSearchParams(filterParams);
                p.delete("stage"); p.delete("page");
                if (s) p.set("stage", s);
                const href = p.toString() ? `/admin/products?${p.toString()}` : "/admin/products";
                return (
                  <Link key={s ?? "all"} href={href} className={tabClass(isActive, "sm")}>
                    {s ? (t.product[s as keyof typeof t.product] as string) : t.common.all}
                  </Link>
                );
              })}
              <span className="text-ink-300 text-[10px]">|</span>
              <FilterSelect paramKey="category" label={t.product.allCategories} value={filterCategory ?? ""} searchParams={filterParams} options={categoryOpts} />
              <FilterSelect paramKey="pricing" label={t.product.allPricing} value={filterPricing ?? ""} searchParams={filterParams} options={pricingOpts} />
              <FilterInput paramKey="vendor" value={filterVendor ?? ""} placeholder={t.product.vendorPlaceholder} searchParams={filterParams} />
            </div>
            <MobileFilterPanel label={t.filter.filterLabel} activeCount={activeFilters.length}>
              <div className="flex flex-wrap gap-1">
                {[undefined, ...PRODUCT_STAGES].map((s) => {
                  const isActive = filterStage === s;
                  const p = new URLSearchParams(filterParams);
                  p.delete("stage"); p.delete("page");
                  if (s) p.set("stage", s);
                  const href = p.toString() ? `/admin/products?${p.toString()}` : "/admin/products";
                  return <Link key={s ?? "all"} href={href} className={tabClass(isActive, "sm")}>{s ? (t.product[s as keyof typeof t.product] as string) : t.common.all}</Link>;
                })}
              </div>
              <FilterSelect paramKey="category" label={t.product.allCategories} value={filterCategory ?? ""} searchParams={filterParams} options={categoryOpts} />
              <FilterSelect paramKey="pricing" label={t.product.allPricing} value={filterPricing ?? ""} searchParams={filterParams} options={pricingOpts} />
              <FilterInput paramKey="vendor" value={filterVendor ?? ""} placeholder={t.product.vendorPlaceholder} searchParams={filterParams} />
            </MobileFilterPanel>
            <div className="flex items-center gap-2 shrink-0">
              <FavoriteFilter entity="products" labels={{ favorites: t.favorite.favorites, all: t.favorite.all }} />
              <div className="hidden lg:flex items-center gap-2">
                <ExportButton entity="products" format="csv" filters={filterParams} label={t.common.exportCSV} />
                <ExportButton entity="products" format="json" filters={filterParams} label={t.common.exportJSON} />
              </div>
              <OverflowMenu>
                <ExportButton entity="products" format="csv" filters={filterParams} label={t.common.exportCSV} />
                <ExportButton entity="products" format="json" filters={filterParams} label={t.common.exportJSON} />
              </OverflowMenu>
              <Link
                href="/admin/products/new"
                className="rounded-md bg-navy-700 px-3 py-1.5 text-[12.5px] text-navy-50 hover:bg-navy-600 transition-colors"
              >
                + {t.common.new}
              </Link>
            </div>
          </header>

          <FilterSummary filters={activeFilters} labels={{ activeFilters: t.filter.activeFilters, clearAll: t.filter.clearAll }} clearHref={clearHref} />

          <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper/30 text-left">
                <SortableHeader column="name" label={t.common.name} currentSort={sortCol} currentDir={sortDir} basePath="/admin/products" searchParams={filterParams} />
                <SortableHeader column="vendor" label={t.vendor.title} currentSort={sortCol} currentDir={sortDir} basePath="/admin/products" searchParams={filterParams} className="hidden lg:table-cell" />
                <SortableHeader column="category" label={t.product.category} currentSort={sortCol} currentDir={sortDir} basePath="/admin/products" searchParams={filterParams} />
                <SortableHeader column="stage" label={t.common.stage} currentSort={sortCol} currentDir={sortDir} basePath="/admin/products" searchParams={filterParams} />
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.product.pricing}</th>
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.product.latestVersion}</th>
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.topics}</th>
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">★</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.length === 0 ? (
                <tr><td colSpan={8}>
                  <EmptyState title={t.empty.products} description={t.empty.productsDesc} />
                </td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-3 sm:px-5 py-3">
                      <Link href={`/admin/products/${p.id}`} className="font-medium text-ink-800 hover:text-navy-600 transition-colors">
                        {p.name}
                      </Link>
                      {p.description && (
                        <p className="text-[11px] text-ink-400 mt-0.5 truncate max-w-[150px] sm:max-w-xs">{p.description}</p>
                      )}
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-5 py-3 text-ink-600">{p.vendor ?? "—"}</td>
                    <td className="px-3 sm:px-5 py-3 text-ink-600 whitespace-nowrap">{t.product[p.category as keyof typeof t.product] as string}</td>
                    <td className="px-3 sm:px-5 py-3 whitespace-nowrap">
                      <StatusPill label={p.stage} lang={lang} />
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-5 py-3 text-ink-600 whitespace-nowrap">{t.product[p.pricing === "open-source" ? "openSource" : p.pricing as keyof typeof t.product] as string}</td>
                    <td className="hidden lg:table-cell px-3 sm:px-5 py-3 text-ink-600 font-mono text-[12px]">{p.latest_version ?? "—"}</td>
                    <td className="hidden lg:table-cell px-3 sm:px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.topics.length > 0
                          ? p.topics.slice(0, 3).map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)
                          : <span className="text-[11px] text-ink-400">—</span>
                        }
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-5 py-3"><FavoriteButton entity="products" id={p.id} label={p.name} /></td>
                  </tr>
                ))
              )}
            </tbody>
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

function Stat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="bg-surface p-6">
      <p className="tracked-label">{label}</p>
      <p className="mt-3 font-sans text-[30px] font-bold leading-none text-ink-900 tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-[12px] text-ink-500">{sub}</p>
    </div>
  );
}
