import { Suspense } from "react";
import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";
import { PapersClient } from "./PapersClient";
import { fetchAndSyncPapers } from "@/lib/admin/papers";

export default async function PapersPage() {
  const { lang, t } = await getDict();
  const papers = await fetchAndSyncPapers();

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.papers }]} t={t} lang={lang} />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10">
        <Suspense>
          <PapersClient papers={papers} lang={lang} labels={{
            title: t.papers.title,
            searchPlaceholder: t.papers.searchPlaceholder,
            allSources: t.papers.allSources,
            allCategories: t.papers.allCategories,
            noMatch: t.papers.noMatch,
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
          }} />
        </Suspense>
      </main>
    </>
  );
}
