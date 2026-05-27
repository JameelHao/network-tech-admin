import { createClient } from "@/lib/supabase/server";
import { SyncStatusBar } from "@/components/admin/SyncStatusBar";
import { Topbar } from "@/components/admin/Topbar";
import { EmptyState } from "@/components/admin/EmptyState";
import Link from "next/link";
import { ExportButton } from "@/components/admin/ExportButton";
import { Pagination } from "@/components/admin/Pagination";
import { listOpenSource } from "@/lib/admin/opensource";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { OverflowMenu } from "@/components/admin/OverflowMenu";
import { StarRangeFilter } from "@/components/admin/StarRangeFilter";
import { OpensourceTableWithModal } from "@/components/admin/OpensourceTableWithModal";
import { getDict } from "@/lib/i18n/server";
import { computeOpenSourceStats } from "@/lib/admin/opensource-utils";
import { getTopicLabel } from "@/lib/admin/topics";
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
  const showFilter = sp.showFilter === "1";
  const result = await listOpenSource(params, {
    language: langFilter,
    topic: topicFilter,
    starsMin: starsMin ? parseInt(starsMin, 10) : undefined,
    starsMax: starsMax ? parseInt(starsMax, 10) : undefined,
  });
  const projects = result.data;
  const { total, active, highStars, languageCount } = computeOpenSourceStats(projects);

  const supabase = await createClient();
  const [{ data: langRows }, { data: topicRows }] = await Promise.all([
    supabase.from("opensource").select("language"),
    supabase.from("opensource").select("topics"),
  ]);
  const allLanguages = Array.from(new Set(langRows?.map((r: any) => r.language).filter(Boolean) ?? [])).sort() as string[];
  const allTopics = Array.from(new Set(topicRows?.flatMap((r: any) => r.topics ?? []) ?? [])).sort() as string[];

  const filterParams: Record<string, string> = {};
  if (langFilter) filterParams.language = langFilter;
  if (topicFilter) filterParams.topic = topicFilter;
  if (starsMin) filterParams.starsMin = starsMin;
  if (starsMax) filterParams.starsMax = starsMax;
  if (sortCol && sortDir) { filterParams.sort = sortCol; filterParams.dir = sortDir; }

  const activeFilters: { label: string; value: string }[] = [];
  if (langFilter) activeFilters.push({ label: t.detail.language, value: langFilter });
  if (topicFilter) activeFilters.push({ label: t.detail.topics, value: getTopicLabel(topicFilter, lang) });
  if (starsMin) activeFilters.push({ label: "Stars ≥", value: starsMin });
  if (starsMax) activeFilters.push({ label: "Stars ≤", value: starsMax });

  const filterParamsStr = new URLSearchParams(filterParams).toString();
  const collapseHref = filterParamsStr ? `/admin/opensource?${filterParamsStr}` : "/admin/opensource";

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
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={showFilter ? collapseHref : `/admin/opensource?showFilter=1&${filterParamsStr}`}
                className={`rounded-md border px-2.5 py-1.5 text-[11px] font-mono transition-colors ${showFilter ? "bg-navy-50 border-navy-300 text-navy-600" : "border-line text-ink-500 hover:bg-paper/40"}`}
              >
                {lang === "zh" ? "筛选" : "Filter"}{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
              </Link>
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

          {showFilter && (
            <div className="px-5 py-4 border-b border-line bg-paper/20 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {allLanguages.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mb-2">{t.detail.language}</p>
                  <div className="flex flex-wrap gap-2">
                    {allLanguages.map((l) => {
                      const p = new URLSearchParams(filterParams);
                      p.delete("page");
                      if (p.get("language") === l) p.delete("language");
                      else p.set("language", l);
                      const href = p.toString() ? `/admin/opensource?${p.toString()}` : "/admin/opensource";
                      const active = langFilter === l;
                      return (
                        <Link key={l} href={href} className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${active ? "bg-navy-50 border-navy-300 text-navy-600" : "border-line text-ink-500 hover:bg-paper/40"}`}>
                          {active && "✓ "}{l}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                )}
                {allTopics.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mb-2">{t.detail.topics}</p>
                  <div className="flex flex-wrap gap-2">
                    {allTopics.map((tp) => {
                      const p = new URLSearchParams(filterParams);
                      p.delete("page");
                      if (p.get("topic") === tp) p.delete("topic");
                      else p.set("topic", tp);
                      const href = p.toString() ? `/admin/opensource?${p.toString()}` : "/admin/opensource";
                      const active = topicFilter === tp;
                      return (
                        <Link key={tp} href={href} className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${active ? "bg-navy-50 border-navy-300 text-navy-600" : "border-line text-ink-500 hover:bg-paper/40"}`}>
                          {active && "✓ "}{getTopicLabel(tp, lang)} <span className="text-ink-400">({tp})</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
                )}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mb-2">{t.detail.stars}</p>
                  <StarRangeFilter starsMin={starsMin} starsMax={starsMax} filterParams={filterParams} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {activeFilters.length > 0 && (
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
                <SortableHeader column="name" label={t.common.name} currentSort={sortCol} currentDir={sortDir} basePath="/admin/opensource" searchParams={filterParams} />
                <SortableHeader column="language" label={t.detail.language} currentSort={sortCol} currentDir={sortDir} basePath="/admin/opensource" searchParams={filterParams} className="hidden lg:table-cell" />
                <SortableHeader column="stars" label={t.detail.stars} currentSort={sortCol} currentDir={sortDir} basePath="/admin/opensource" searchParams={filterParams} />
                <SortableHeader column="last_active" label={t.detail.lastActive} currentSort={sortCol} currentDir={sortDir} basePath="/admin/opensource" searchParams={filterParams} />
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.topics}</th>
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.list.repo}</th>
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">★</th>
              </tr>
            </thead>
            {projects.length === 0 ? (
              <tbody className="divide-y divide-line">
                <tr><td colSpan={7}>
                  <EmptyState title={t.empty.opensource} description={t.empty.opensourceDesc} />
                </td></tr>
              </tbody>
            ) : (
              <OpensourceTableWithModal projects={projects} t={t} lang={lang} />
            )}
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
