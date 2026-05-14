import { SyncStatusBar } from "@/components/admin/SyncStatusBar";
import { Topbar } from "@/components/admin/Topbar";
import { EmptyState } from "@/components/admin/EmptyState";
import { ExportButton } from "@/components/admin/ExportButton";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { FavoriteFilter } from "@/components/admin/FavoriteFilter";
import { Pagination } from "@/components/admin/Pagination";
import { TopicTag } from "@/components/admin/TopicTag";
import { listOpenSource } from "@/lib/admin/opensource";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { FilterSelect, FilterNumberRange } from "@/components/admin/FilterControls";
import { MobileFilterPanel } from "@/components/admin/MobileFilterPanel";
import { OverflowMenu } from "@/components/admin/OverflowMenu";
import { getDict } from "@/lib/i18n/server";
import { computeOpenSourceStats } from "@/lib/admin/opensource-utils";
import Link from "next/link";
import type { SortDir } from "@/lib/admin/pagination";

export default async function OpenSourcePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp);
  const sortCol = typeof sp.sort === "string" ? sp.sort : undefined;
  const sortDir = typeof sp.dir === "string" ? sp.dir as SortDir : undefined;
  const langFilter = typeof sp.language === "string" ? sp.language : undefined;
  const topicFilter = typeof sp.topic === "string" ? sp.topic : undefined;
  const starsMin = typeof sp.starsMin === "string" ? sp.starsMin : undefined;
  const starsMax = typeof sp.starsMax === "string" ? sp.starsMax : undefined;
  const result = await listOpenSource(params, {
    language: langFilter,
    topic: topicFilter,
    starsMin: starsMin ? parseInt(starsMin, 10) : undefined,
    starsMax: starsMax ? parseInt(starsMax, 10) : undefined,
  });
  const projects = result.data;
  const { total, active, highStars, languageCount } = computeOpenSourceStats(projects);

  const allLanguages = Array.from(new Set(projects.map((o) => o.language).filter(Boolean) as string[])).sort();
  const allTopics = Array.from(new Set(projects.flatMap((o) => o.topics))).sort();

  const filterParams: Record<string, string> = {};
  if (langFilter) filterParams.language = langFilter;
  if (topicFilter) filterParams.topic = topicFilter;
  if (starsMin) filterParams.starsMin = starsMin;
  if (starsMax) filterParams.starsMax = starsMax;
  if (sortCol && sortDir) { filterParams.sort = sortCol; filterParams.dir = sortDir; }

  const activeFilters: { label: string; value: string }[] = [];
  if (langFilter) activeFilters.push({ label: t.detail.language, value: langFilter });
  if (topicFilter) activeFilters.push({ label: t.detail.topics, value: topicFilter });
  if (starsMin) activeFilters.push({ label: "Stars ≥", value: starsMin });
  if (starsMax) activeFilters.push({ label: "Stars ≤", value: starsMax });

  const clearParams = new URLSearchParams();
  if (sortCol && sortDir) { clearParams.set("sort", sortCol); clearParams.set("dir", sortDir); }
  const clearHref = clearParams.toString() ? `/admin/opensource?${clearParams.toString()}` : "/admin/opensource";

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.opensource }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
            {t.nav.opensource}
          </p>
          <p className="mt-4 max-w-2xl text-[13.5px] text-ink-500">
            {t.oss.description}
          </p>
        </header>

        <SyncStatusBar entity="opensource" lang={lang} labels={{ lastSync: t.sync.lastSync, refresh: t.sync.refresh, refreshing: t.sync.refreshing, noData: t.sync.noData, syncResult: t.sync.syncResult, sourcesFailed: t.sync.sourcesFailed }} />

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">
          {t.oss.overview}
        </p>
        <section className="mb-4 rounded-lg border border-line bg-surface overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            <Stat label={t.oss.totalProjects} value={total} sub={t.oss.totalSub} />
            <Stat label={t.oss.activeProjects} value={active} sub={t.oss.activeSub} />
            <Stat label={t.oss.highStars} value={highStars} sub={t.oss.highStarsSub} />
            <Stat label={t.oss.languages} value={languageCount} sub={t.oss.languagesSub} />
          </div>
        </section>

        <div data-fav-filter="opensource" className="rounded-lg border border-line bg-surface">
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line bg-paper/30">
            <div className="hidden lg:flex flex-wrap items-center gap-2">
              {allLanguages.length > 1 && (
                <FilterSelect paramKey="language" label={t.filter.allLanguages} value={langFilter ?? ""} searchParams={filterParams} options={allLanguages.map((l) => ({ value: l, label: l }))} />
              )}
              {allTopics.length > 1 && (
                <FilterSelect paramKey="topic" label={t.filter.allTopics} value={topicFilter ?? ""} searchParams={filterParams} options={allTopics.map((tp) => ({ value: tp, label: tp }))} />
              )}
              <FilterNumberRange minKey="starsMin" maxKey="starsMax" minValue={starsMin ?? ""} maxValue={starsMax ?? ""} minLabel="Min" maxLabel="Max" searchParams={filterParams} />
            </div>
            <div className="lg:hidden">
              <MobileFilterPanel label={t.filter.filterLabel} activeCount={activeFilters.length}>
                {allLanguages.length > 1 && (
                  <FilterSelect paramKey="language" label={t.filter.allLanguages} value={langFilter ?? ""} searchParams={filterParams} options={allLanguages.map((l) => ({ value: l, label: l }))} />
                )}
                {allTopics.length > 1 && (
                  <FilterSelect paramKey="topic" label={t.filter.allTopics} value={topicFilter ?? ""} searchParams={filterParams} options={allTopics.map((tp) => ({ value: tp, label: tp }))} />
                )}
                <FilterNumberRange minKey="starsMin" maxKey="starsMax" minValue={starsMin ?? ""} maxValue={starsMax ?? ""} minLabel="Min" maxLabel="Max" searchParams={filterParams} />
              </MobileFilterPanel>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <FavoriteFilter entity="opensource" labels={{ favorites: t.favorite.favorites, all: t.favorite.all }} />
              <div className="hidden lg:flex items-center gap-2">
                <ExportButton entity="opensource" format="csv" label={t.common.exportCSV} />
                <ExportButton entity="opensource" format="json" label={t.common.exportJSON} />
              </div>
              <OverflowMenu>
                <ExportButton entity="opensource" format="csv" label={t.common.exportCSV} />
                <ExportButton entity="opensource" format="json" label={t.common.exportJSON} />
              </OverflowMenu>
            </div>
          </header>
          <FilterSummary filters={activeFilters} labels={{ activeFilters: t.filter.activeFilters, clearAll: t.filter.clearAll }} clearHref={clearHref} />
          <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper/30 text-left">
                <SortableHeader column="name" label={t.common.name} currentSort={sortCol} currentDir={sortDir} basePath="/admin/opensource" searchParams={filterParams} />
                <SortableHeader column="language" label={t.detail.language} currentSort={sortCol} currentDir={sortDir} basePath="/admin/opensource" searchParams={filterParams} className="hidden lg:table-cell" />
                <SortableHeader column="stars" label={t.detail.stars} currentSort={sortCol} currentDir={sortDir} basePath="/admin/opensource" searchParams={filterParams} />
                <SortableHeader column="last_active" label={t.detail.lastActive} currentSort={sortCol} currentDir={sortDir} basePath="/admin/opensource" searchParams={filterParams} />
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.topics}</th>
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.list.repo}</th>
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">★</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {projects.length === 0 && (
                <tr><td colSpan={7}>
                  <EmptyState title={t.empty.opensource} description={t.empty.opensourceDesc} />
                </td></tr>
              )}
              {projects.map((o) => (
                <tr key={o.id} className="hover:bg-paper/40 transition-colors">
                  <td className="px-3 sm:px-5 py-3">
                    <Link href={`/admin/opensource/${o.id}`} className="font-normal text-ink-800 hover:text-navy-600 transition-colors">
                      {o.name}
                    </Link>
                    {o.description && (
                      <p className="text-[11px] text-ink-400 mt-0.5 truncate max-w-[150px] sm:max-w-xs">{o.description}</p>
                    )}
                  </td>
                  <td className="hidden lg:table-cell px-3 sm:px-5 py-3 text-ink-600">{o.language ?? "—"}</td>
                  <td className="px-3 sm:px-5 py-3 text-ink-600 tabular-nums whitespace-nowrap">{o.stars?.toLocaleString() ?? "—"}</td>
                  <td className="px-3 sm:px-5 py-3 text-ink-600 tabular-nums whitespace-nowrap">{o.last_active ?? "—"}</td>
                  <td className="hidden lg:table-cell px-3 sm:px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {o.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-3 sm:px-5 py-3">
                    {o.repo_url ? (
                      <a href={o.repo_url} target="_blank" rel="noopener noreferrer" className="text-navy-500 hover:text-navy-700">
                        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor"><path d="M8 .2A8 8 0 0 0 5.47 15.79c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.42 7.42 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 8 .2Z"/></svg>
                      </a>
                    ) : <span className="text-ink-300">—</span>}
                  </td>
                  <td className="hidden lg:table-cell px-3 sm:px-5 py-3"><FavoriteButton entity="opensource" id={o.id} label={o.name} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            basePath="/admin/opensource"
            searchParams={filterParams}
            labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
          />
        </div>
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
