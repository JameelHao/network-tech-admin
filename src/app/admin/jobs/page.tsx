import { Suspense } from "react";
import { Topbar } from "@/components/admin/Topbar";
import { SyncStatusBar } from "@/components/admin/SyncStatusBar";
import { getDict } from "@/lib/i18n/server";
import { JobsContent } from "./JobsContent";

export default async function JobsPage() {
  const { t, lang } = await getDict();

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.jobs }]} t={t} lang={lang} />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10">
        <SyncStatusBar entity="jobs" lang={lang} labels={{ lastSync: t.sync.lastSync, refresh: t.sync.refresh, refreshing: t.sync.refreshing, noData: t.sync.noData }} />
        <Suspense>
          <JobsContent lang={lang} labels={{
            title: t.jobs.title,
            searchPlaceholder: t.jobs.searchPlaceholder,
            allSources: t.jobs.allSources,
            noMatch: t.jobs.noMatch,
            emptyDesc: t.empty.jobsDesc,
            errorMessage: t.error.fetchFailed,
            retryLabel: t.error.retry,
            rows: t.common.rows,
            page: t.common.page,
            filter: t.mobile.filter,
            expired: t.list.expired,
            sortLabel: t.sort.sortBy,
            titleLabel: t.common.title,
            sourceLabel: t.list.source,
            pubDateLabel: t.list.publishedAt,
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
