import { Suspense } from "react";
import { Topbar } from "@/components/admin/Topbar";
import { SyncStatusBar } from "@/components/admin/SyncStatusBar";
import { getDict } from "@/lib/i18n/server";
import { PapersClient } from "./PapersClient";
import { listPapersForList } from "@/lib/admin/papers";
import { findDuplicateGroups } from "@/lib/admin/paper-dedup";

export default async function PapersPage() {
  const { lang, t } = await getDict();
  const { papers: rawPapers } = await listPapersForList();
  // Client-side dedup — guard against any pagination edge cases
  const seen = new Set<string>();
  const papers = rawPapers.filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
  const duplicateGroups = findDuplicateGroups(papers);

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.papers }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
            {t.nav.papers}
          </p>
        </header>

        <SyncStatusBar entity="papers" lang={lang} labels={{ lastSync: t.sync.lastSync, refresh: t.sync.refresh, refreshing: t.sync.refreshing, noData: t.sync.noData, syncResult: t.sync.syncResult, sourcesFailed: t.sync.sourcesFailed }} />

        <Suspense>
          <PapersClient papers={papers} duplicateGroups={duplicateGroups} lang={lang} t={t} now={Date.now()} labels={{
            title: t.papers.title,
            searchPlaceholder: t.papers.searchPlaceholder,
            allSources: t.papers.allSources,
            allCategories: t.papers.allCategories,
            noMatch: t.papers.noMatch,
            emptyDesc: t.empty.papersDesc,
            exportCSV: t.common.exportCSV,
            exportJSON: t.common.exportJSON,
            viewList: t.papers.viewList,
            viewCluster: t.papers.viewCluster,
            papersCount: t.papers.papersCount,
            dateRange: t.papers.dateRange,
            filter: t.mobile.filter,
            publishedAt: t.list.publishedAt,
            sortLabel: t.sort.sortBy,
            titleLabel: t.common.title,
            activeFilters: t.filter.activeFilters,
            clearAll: t.filter.clearAll,
            dateFrom: t.filter.dateFrom,
            dateTo: t.filter.dateTo,
            timeRange: { today: t.time.today, week: t.time.thisWeek, month: t.time.thisMonth, all: t.time.all },
            newLabel: t.time.new,
            favorites: t.favorite.favorites,
            favoritesAll: t.favorite.all,
            authors: t.detail.authors,
            venue: t.detail.venue,
            topics: t.detail.topics,

            source: t.papers.source,
            rows: t.common.rows,
            page: t.common.page,
            dedup: {
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
            },
          }} />
        </Suspense>
      </main>
    </>
  );
}
