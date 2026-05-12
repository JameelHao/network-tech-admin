import { Topbar } from "@/components/admin/Topbar";
import { SyncStatusBar } from "@/components/admin/SyncStatusBar";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { TopicTag } from "@/components/admin/TopicTag";
import { NewBadge } from "@/components/admin/NewBadge";
import { ExportButton } from "@/components/admin/ExportButton";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { FavoriteFilter } from "@/components/admin/FavoriteFilter";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { FilterDateRange, FilterSelect, FilterInput } from "@/components/admin/FilterControls";
import { DuplicateWarning } from "@/components/admin/DuplicateWarning";
import { listPapers, fetchAndSyncPapers } from "@/lib/admin/papers";
import { findDuplicateGroups } from "@/lib/admin/paper-dedup";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { relativeTime, isNew, isExpired } from "@/lib/admin/format";
import { getDict } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import type { SortDir } from "@/lib/admin/pagination";

export default async function PapersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp, { pageSize: 25 });

  const keyword = typeof sp.q === "string" ? sp.q : undefined;
  const venue = typeof sp.venue === "string" ? sp.venue : undefined;
  const topic = typeof sp.topic === "string" ? sp.topic : undefined;
  const dateFrom = typeof sp.dateFrom === "string" ? sp.dateFrom : undefined;
  const dateTo = typeof sp.dateTo === "string" ? sp.dateTo : undefined;

  const supabase = await createClient();

  const { data: allPapersCheck } = await supabase
    .from("papers")
    .select("id", { count: "exact", head: true });

  if (!allPapersCheck) {
    await fetchAndSyncPapers();
  }

  const result = await listPapers(params, { keyword, venue, topic, dateFrom, dateTo });
  const papers = result.data;

  const duplicateGroups = findDuplicateGroups(papers);

  const { data: venueRows } = await supabase
    .from("papers")
    .select("venue")
    .not("venue", "is", null);
  const venues = Array.from(new Set((venueRows ?? []).map((r) => r.venue as string).filter(Boolean))).sort();

  const { data: topicRows } = await supabase
    .from("papers")
    .select("topics");
  const allTopics = Array.from(new Set((topicRows ?? []).flatMap((r) => r.topics as string[]))).sort();

  const sortCol = typeof sp.sort === "string" ? sp.sort : undefined;
  const sortDir = typeof sp.dir === "string" ? sp.dir as SortDir : undefined;

  const filterParams: Record<string, string> = {};
  if (keyword) filterParams.q = keyword;
  if (venue) filterParams.venue = venue;
  if (topic) filterParams.topic = topic;
  if (dateFrom) filterParams.dateFrom = dateFrom;
  if (dateTo) filterParams.dateTo = dateTo;
  if (sortCol && sortDir) { filterParams.sort = sortCol; filterParams.dir = sortDir; }

  const activeFilters: { label: string; value: string }[] = [];
  if (keyword) activeFilters.push({ label: t.papers.searchPlaceholder, value: keyword });
  if (venue) activeFilters.push({ label: t.papers.allSources, value: venue });
  if (topic) activeFilters.push({ label: t.papers.allCategories, value: topic });
  if (dateFrom) activeFilters.push({ label: t.filter.dateFrom, value: dateFrom });
  if (dateTo) activeFilters.push({ label: t.filter.dateTo, value: dateTo });

  const clearParams = new URLSearchParams();
  if (sortCol && sortDir) { clearParams.set("sort", sortCol); clearParams.set("dir", sortDir); }
  const clearHref = clearParams.toString() ? `/admin/papers?${clearParams.toString()}` : "/admin/papers";

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.papers }]} t={t} lang={lang} />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10">
        <SyncStatusBar entity="papers" lang={lang} labels={{ lastSync: t.sync.lastSync, refresh: t.sync.refresh, refreshing: t.sync.refreshing, noData: t.sync.noData }} />

        <section data-fav-filter="papers" className="rounded-lg border border-line bg-surface overflow-hidden">
          <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-line bg-paper/30">
            <div className="flex items-center gap-2 overflow-x-auto">
              <h1 className="font-display text-[17px] tracking-tight text-ink-800 shrink-0">
                {t.papers.title}
                <span className="ml-2 font-mono text-[11px] tabular-nums text-ink-400">{result.total}</span>
              </h1>
              <FilterInput
                paramKey="q"
                value={keyword ?? ""}
                placeholder={t.papers.searchPlaceholder}
                searchParams={filterParams}
              />
              {venues.length > 1 && (
                <FilterSelect
                  paramKey="venue"
                  label={t.papers.allSources}
                  options={venues.map((v) => ({ value: v, label: v }))}
                  value={venue ?? ""}
                  searchParams={filterParams}
                />
              )}
              {allTopics.length > 1 && (
                <FilterSelect
                  paramKey="topic"
                  label={t.papers.allCategories}
                  options={allTopics.map((tp) => ({ value: tp, label: tp }))}
                  value={topic ?? ""}
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
            <div className="flex items-center gap-2 shrink-0">
              <FavoriteFilter entity="papers" labels={{ favorites: t.favorite.favorites, all: t.favorite.all }} />
              <ExportButton entity="papers" format="csv" label={t.common.exportCSV} />
              <ExportButton entity="papers" format="json" label={t.common.exportJSON} />
            </div>
          </header>

          <FilterSummary filters={activeFilters} labels={{ activeFilters: t.filter.activeFilters, clearAll: t.filter.clearAll }} clearHref={clearHref} />

          {duplicateGroups.length > 0 && (
            <DuplicateWarning groups={duplicateGroups} labels={{
              warning: t.dedup.warning,
              groupsFound: t.dedup.groupsFound,
              viewDetails: t.dedup.viewDetails,
              hide: t.dedup.hide,
              similarity: t.dedup.similarity,
              exactTitle: t.dedup.exactTitle,
              similarTitle: t.dedup.similarTitle,
              sameAuthorsSimilarTitle: t.dedup.sameAuthorsSimilarTitle,
              ignore: t.dedup.ignore,
              reset: t.dedup.reset,
            }} />
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-line bg-paper/30">
                  <SortableHeader column="title" label={t.common.title} currentSort={sortCol} currentDir={sortDir} basePath="/admin/papers" searchParams={filterParams} />
                  <Th>{t.detail.authors}</Th>
                  <Th>{t.papers.affiliations}</Th>
                  <SortableHeader column="venue" label={t.detail.venue} currentSort={sortCol} currentDir={sortDir} basePath="/admin/papers" searchParams={filterParams} />
                  <Th>{t.detail.topics}</Th>
                  <SortableHeader column="published_date" label={t.list.publishedAt} currentSort={sortCol} currentDir={sortDir} basePath="/admin/papers" searchParams={filterParams} />
                  <Th>{t.papers.status}</Th>
                  <Th>{t.papers.citations}</Th>
                  <Th>{t.list.link}</Th>
                  <Th>★</Th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p) => {
                  const stale = isExpired(p.published_date, 30);
                  const isNewPaper = isNew(p.published_date);
                  return (
                    <tr key={p.id} data-fav={true} className={`group border-b border-line last:border-b-0 hover:bg-paper/40 transition-colors ${stale ? "opacity-50" : ""}`}>
                      <Td>
                        <p className={`text-[13px] font-medium line-clamp-2 max-w-[280px] ${stale ? "text-ink-500" : "text-ink-800"}`}>
                          {p.title}
                        </p>
                      </Td>
                      <Td>
                        <span className="text-[12px] text-ink-600 max-w-[160px] block truncate" title={p.authors.join(", ")}>
                          {p.authors.length === 0 ? "—" : (
                            <>
                              {p.authors.slice(0, 2).join(", ")}
                              {p.authors.length > 2 && <span className="text-ink-400"> +{p.authors.length - 2}</span>}
                            </>
                          )}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-[12px] text-ink-400">—</span>
                      </Td>
                      <Td>
                        {p.venue ? (
                          <span className="rounded-full bg-navy-50 border border-navy-200 px-2 py-0.5 font-mono text-[10px] text-navy-700">
                            {p.venue}
                          </span>
                        ) : <span className="text-ink-400">—</span>}
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          {p.topics.slice(0, 3).map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}
                          {p.topics.length > 3 && <span className="text-[10px] text-ink-400">+{p.topics.length - 3}</span>}
                        </div>
                      </Td>
                      <Td>
                        {p.published_date ? (
                          <span className="font-mono text-[11.5px] tabular-nums text-ink-700" title={p.published_date}>
                            {relativeTime(p.published_date, lang)}
                          </span>
                        ) : <span className="text-ink-400">—</span>}
                      </Td>
                      <Td>
                        {isNewPaper ? (
                          <NewBadge label={t.time.new} />
                        ) : stale ? (
                          <span className="rounded-full bg-ink-100 px-1.5 py-0.5 font-mono text-[9px] text-ink-500 uppercase tracking-[0.1em]">
                            {t.list.expired}
                          </span>
                        ) : null}
                      </Td>
                      <Td>
                        <span className="text-[12px] text-ink-400">—</span>
                      </Td>
                      <Td>
                        {p.url ? (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-navy-500 hover:text-navy-700">
                            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3.5h-2a1.5 1.5 0 0 0-1.5 1.5v7a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5v-2m-4-7h5m0 0v5m0-5-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </a>
                        ) : <span className="text-ink-300">—</span>}
                      </Td>
                      <Td><FavoriteButton entity="papers" id={p.id} label={p.title} /></Td>
                    </tr>
                  );
                })}
                {papers.length === 0 && (
                  <tr><td colSpan={10}>
                    <EmptyState title={t.papers.noMatch} description={t.empty.papersDesc} compact />
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
              basePath="/admin/papers"
              searchParams={filterParams}
              labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
            />
          )}
        </section>
      </main>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 text-left">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
}
