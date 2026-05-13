import { Suspense } from "react";
import { Topbar } from "@/components/admin/Topbar";
import { SyncStatusBar } from "@/components/admin/SyncStatusBar";
import { getDict } from "@/lib/i18n/server";
import { PapersClient } from "./PapersClient";
import { fetchAndSyncPapers } from "@/lib/admin/papers";
import { findDuplicateGroups } from "@/lib/admin/paper-dedup";

export default async function PapersPage() {
  const { lang, t } = await getDict();
  const papers = await fetchAndSyncPapers();
  const duplicateGroups = findDuplicateGroups(papers);

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.papers }]} t={t} lang={lang} />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10">
        <SyncStatusBar entity="papers" lang={lang} labels={{ lastSync: t.sync.lastSync, refresh: t.sync.refresh, refreshing: t.sync.refreshing, noData: t.sync.noData, syncResult: t.sync.syncResult, sourcesFailed: t.sync.sourcesFailed }} />
        <Suspense>
          <PapersClient papers={papers} duplicateGroups={duplicateGroups} lang={lang} labels={{
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
