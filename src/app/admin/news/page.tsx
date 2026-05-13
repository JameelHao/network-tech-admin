import { Topbar } from "@/components/admin/Topbar";
import { SyncStatusBar } from "@/components/admin/SyncStatusBar";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { NewBadge } from "@/components/admin/NewBadge";
import { ExportButton } from "@/components/admin/ExportButton";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { FavoriteFilter } from "@/components/admin/FavoriteFilter";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { FilterDateRange, FilterSelect, FilterInput } from "@/components/admin/FilterControls";
import { MobileFilterPanel } from "@/components/admin/MobileFilterPanel";
import { OverflowMenu } from "@/components/admin/OverflowMenu";
import { listNews } from "@/lib/admin/news";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { relativeTime, isNew, isExpired } from "@/lib/admin/format";
import { getDict } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import type { SortDir } from "@/lib/admin/pagination";

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
}

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
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10">
        <SyncStatusBar entity="news" lang={lang} labels={{ lastSync: t.sync.lastSync, refresh: t.sync.refresh, refreshing: t.sync.refreshing, noData: t.sync.noData }} />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="font-sans text-[15px] font-semibold tracking-tight text-ink-800 shrink-0">
            {t.news.title}
            <span className="ml-2 font-mono text-[11px] tabular-nums text-ink-400">{result.total}</span>
          </h1>
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
        </div>

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
                  <Th className="hidden lg:table-cell">{t.news.snippet}</Th>
                  <Th className="hidden lg:table-cell">{t.news.freshness}</Th>
                  <Th>★</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const stale = isExpired(item.pub_date, 7);
                  const isNewItem = isNew(item.pub_date);
                  return (
                    <tr key={item.id} data-fav={true} className={`group border-b border-line last:border-b-0 hover:bg-paper/40 transition-colors ${stale ? "opacity-50" : ""}`}>
                      <Td>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-[13px] font-medium line-clamp-2 max-w-[300px] block hover:text-navy-700 ${stale ? "text-ink-500" : "text-ink-800"}`}
                        >
                          {item.title}
                        </a>
                      </Td>
                      <Td>
                        {item.source ? (
                          <span className="rounded-full bg-navy-50 border border-navy-200 px-2 py-0.5 font-mono text-[10px] text-navy-700">
                            {item.source}
                          </span>
                        ) : <span className="text-ink-400">—</span>}
                      </Td>
                      <Td className="hidden lg:table-cell">
                        <span className="font-mono text-[11px] text-ink-500">{extractDomain(item.link)}</span>
                      </Td>
                      <Td className="hidden lg:table-cell">
                        <span className="text-[12px] text-ink-400">—</span>
                      </Td>
                      <Td className="whitespace-nowrap">
                        {item.pub_date ? (
                          <span className="font-mono text-[11.5px] tabular-nums text-ink-700" title={item.pub_date}>
                            {relativeTime(item.pub_date, lang)}
                          </span>
                        ) : <span className="text-ink-400">—</span>}
                      </Td>
                      <Td className="hidden lg:table-cell">
                        {item.snippet ? (
                          <span className="text-[12px] text-ink-500 line-clamp-1 max-w-[200px] block" title={item.snippet}>
                            {item.snippet}
                          </span>
                        ) : <span className="text-ink-400">—</span>}
                      </Td>
                      <Td className="hidden lg:table-cell">
                        {isNewItem ? (
                          <NewBadge label={t.time.new} />
                        ) : stale ? (
                          <span className="rounded-full bg-ink-100 px-1.5 py-0.5 font-mono text-[9px] text-ink-500 uppercase tracking-[0.1em]">
                            {t.list.expired}
                          </span>
                        ) : null}
                      </Td>
                      <Td><FavoriteButton entity="news" id={item.id} label={item.title} /></Td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr><td colSpan={8}>
                    <EmptyState title={t.news.noMatch} description={t.empty.newsDesc} compact />
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {result.totalPages > 1 && (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
              pageSize={result.pageSize}
              basePath="/admin/news"
              searchParams={filterParams}
              labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
            />
          )}
        </section>
      </main>
    </>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 sm:px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 text-left ${className ?? ""}`}>{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 sm:px-4 py-3 align-middle ${className ?? ""}`}>{children}</td>;
}
