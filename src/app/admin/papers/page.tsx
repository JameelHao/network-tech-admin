import { Suspense } from "react";
import { Topbar } from "@/components/admin/Topbar";
import { SyncStatusBar } from "@/components/admin/SyncStatusBar";
import { getDict } from "@/lib/i18n/server";
import { PapersClient } from "./PapersClient";
import { listPapersForList } from "@/lib/admin/papers";
import { findDuplicateGroups } from "@/lib/admin/paper-dedup";
import { computePaperStats } from "@/lib/admin/paper-utils";

export default async function PapersPage() {
  const { lang, t } = await getDict();
  const { papers, total: dbTotal } = await listPapersForList();
  const duplicateGroups = findDuplicateGroups(papers);
  const { total, thisWeek, arxivCount, venueCount } = computePaperStats(papers, Date.now(), dbTotal);

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.papers }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
            {t.nav.papers}
          </p>
          <p className="mt-4 max-w-2xl text-[13.5px] text-ink-500">
            {t.papers.description}
          </p>
        </header>

        <SyncStatusBar entity="papers" lang={lang} labels={{ lastSync: t.sync.lastSync, refresh: t.sync.refresh, refreshing: t.sync.refreshing, noData: t.sync.noData, syncResult: t.sync.syncResult, sourcesFailed: t.sync.sourcesFailed }} />

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">
          {t.papers.overview}
        </p>
        <section className="mb-4 rounded-lg border border-line bg-surface overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            <Stat label={t.papers.totalPapers} value={total} sub={t.papers.totalSub} />
            <Stat label={t.papers.thisWeek} value={thisWeek} sub={t.papers.thisWeekSub} />
            <Stat label={t.papers.arxivPapers} value={arxivCount} sub={t.papers.arxivSub} />
            <Stat label={t.papers.venuePapers} value={venueCount} sub={t.papers.venueSub} />
          </div>
        </section>

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
