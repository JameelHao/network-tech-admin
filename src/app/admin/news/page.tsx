import { Topbar } from "@/components/admin/Topbar";
import { SyncStatusBar } from "@/components/admin/SyncStatusBar";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { ExportButton } from "@/components/admin/ExportButton";
import { FavoriteFilter } from "@/components/admin/FavoriteFilter";
import { NewsTableWithModal } from "@/components/admin/NewsTableWithModal";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { FilterDateRange, FilterSelect, FilterInput } from "@/components/admin/FilterControls";
import { MobileFilterPanel } from "@/components/admin/MobileFilterPanel";
import { OverflowMenu } from "@/components/admin/OverflowMenu";
import { listNews } from "@/lib/admin/news";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { getDict } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import type { SortDir } from "@/lib/admin/pagination";

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp, { pageSize: 25 });

  const keyword = typeof sp.q === "string" ? sp.q : undefined;
  const source = typeof sp.source === "string" ? sp.source : undefined;
  const dateFrom = typeof sp.dateFrom === "string" ? sp.dateFrom : undefined;
  const dateTo = typeof sp.dateTo === "string" ? sp.dateTo : undefined;

  const result = await listNews(params, { keyword, source, dateFrom, dateTo });
  const items = result.data;

  const supabase = await createClient();
  const { data: sourceRows } = await supabase
    .from("news_items")
    .select("source")
    .eq("category", "news")
    .not("source", "is", null);
  const sources = Array.from(new Set((sourceRows ?? []).map((r) => r.source as string).filter(Boolean))).sort();

  const sortCol = typeof sp.sort === "string" ? sp.sort : undefined;
  const sortDir = typeof sp.dir === "string" ? sp.dir as SortDir : undefined;

  const filterParams: Record<string, string> = {};
  if (keyword) filterParams.q = keyword;
  if (source) filterParams.source = source;
  if (dateFrom) filterParams.dateFrom = dateFrom;
  if (dateTo) filterParams.dateTo = dateTo;
  if (sortCol && sortDir) { filterParams.sort = sortCol; filterParams.dir = sortDir; }

  const activeFilters: { label: string; value: string }[] = [];
  if (keyword) activeFilters.push({ label: t.news.searchPlaceholder, value: keyword });
  if (source) activeFilters.push({ label: t.news.allSources, value: source });
  if (dateFrom) activeFilters.push({ label: t.filter.dateFrom, value: dateFrom });
  if (dateTo) activeFilters.push({ label: t.filter.dateTo, value: dateTo });

  const clearParams = new URLSearchParams();
  if (sortCol && sortDir) { clearParams.set("sort", sortCol); clearParams.set("dir", sortDir); }
  const clearHref = clearParams.toString() ? `/admin/news?${clearParams.toString()}` : "/admin/news";

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.news }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
            {t.nav.news}
          </p>
          <p className="mt-4 max-w-2xl text-[13.5px] text-ink-500">
            {t.news.description}
          </p>
        </header>

        <SyncStatusBar entity="news" lang={lang} labels={{ lastSync: t.sync.lastSync, refresh: t.sync.refresh, refreshing: t.sync.refreshing, noData: t.sync.noData, syncResult: t.sync.syncResult, sourcesFailed: t.sync.sourcesFailed }} />

        <section data-fav-filter="news" className="rounded-lg border border-line bg-surface overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line bg-paper/30">
            <div className="hidden lg:flex flex-wrap items-center gap-2">
              <FilterInput
                paramKey="q"
                value={keyword ?? ""}
                placeholder={t.news.searchPlaceholder}
                searchParams={filterParams}
              />
              {sources.length > 1 && (
                <FilterSelect
                  paramKey="source"
                  label={t.news.allSources}
                  options={sources.map((s) => ({ value: s, label: s }))}
                  value={source ?? ""}
                  searchParams={filterParams}
                />
              )}
              <FilterDateRange
                fromKey="dateFrom" toKey="dateTo"
                fromValue={dateFrom ?? ""} toValue={dateTo ?? ""}
                fromLabel={t.filter.dateFrom} toLabel={t.filter.dateTo}
                searchParams={filterParams}
              />
            </div>
            <MobileFilterPanel label={t.filter.filterLabel} activeCount={activeFilters.length}>
              <FilterInput
                paramKey="q"
                value={keyword ?? ""}
                placeholder={t.news.searchPlaceholder}
                searchParams={filterParams}
              />
              {sources.length > 1 && (
                <FilterSelect
                  paramKey="source"
                  label={t.news.allSources}
                  options={sources.map((s) => ({ value: s, label: s }))}
                  value={source ?? ""}
                  searchParams={filterParams}
                />
              )}
              <FilterDateRange
                fromKey="dateFrom" toKey="dateTo"
                fromValue={dateFrom ?? ""} toValue={dateTo ?? ""}
                fromLabel={t.filter.dateFrom} toLabel={t.filter.dateTo}
                searchParams={filterParams}
              />
            </MobileFilterPanel>
            <div className="flex items-center gap-2 shrink-0">
              <FavoriteFilter entity="news" labels={{ favorites: t.favorite.favorites, all: t.favorite.all }} />
              <div className="hidden lg:flex items-center gap-2">
                <ExportButton entity="news" format="csv" label={t.common.exportCSV} />
                <ExportButton entity="news" format="json" label={t.common.exportJSON} />
              </div>
              <OverflowMenu>
                <ExportButton entity="news" format="csv" label={t.common.exportCSV} />
                <ExportButton entity="news" format="json" label={t.common.exportJSON} />
              </OverflowMenu>
            </div>
          </header>

          <FilterSummary filters={activeFilters} labels={{ activeFilters: t.filter.activeFilters, clearAll: t.filter.clearAll }} clearHref={clearHref} />

          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-line bg-paper/30">
                  <SortableHeader column="title" label={t.common.title} currentSort={sortCol} currentDir={sortDir} basePath="/admin/news" searchParams={filterParams} />
                  <SortableHeader column="source" label={t.list.source} currentSort={sortCol} currentDir={sortDir} basePath="/admin/news" searchParams={filterParams} />
                  <Th className="hidden lg:table-cell">{t.news.domain}</Th>
                  <Th className="hidden lg:table-cell">{t.detail.topics}</Th>
                  <SortableHeader column="pub_date" label={t.list.publishedAt} currentSort={sortCol} currentDir={sortDir} basePath="/admin/news" searchParams={filterParams} />
                  <Th className="hidden lg:table-cell">{t.news.freshness}</Th>
                  <Th>★</Th>
                </tr>
              </thead>
              {items.length === 0 ? (
                <tbody>
                  <tr><td colSpan={7}>
                    <EmptyState title={t.news.noMatch} description={t.empty.newsDesc} compact />
                  </td></tr>
                </tbody>
              ) : (
                <NewsTableWithModal items={items} t={t} lang={lang} now={Date.now()} />
              )}
            </table>
          </div>

          <div data-fav-empty="news" className="hidden">
            <EmptyState title={t.favorite.favorites} description={t.empty.newsDesc} compact />
          </div>

          {result.totalPages > 1 && (
            <div data-fav-pagination="news">
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                total={result.total}
                pageSize={result.pageSize}
                basePath="/admin/news"
                searchParams={filterParams}
                labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
              />
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 sm:px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 text-left ${className ?? ""}`}>{children}</th>;
}

