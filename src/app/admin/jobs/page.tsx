import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";
import { JobsContent } from "./JobsContent";

export default async function JobsPage() {
  const { t, lang } = await getDict();

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.jobs }]} t={t} lang={lang} />
      <main className="flex-1 px-6 xl:px-10 py-10">
        <JobsContent labels={{
          title: t.jobs.title,
          searchPlaceholder: t.jobs.searchPlaceholder,
          allSources: t.jobs.allSources,
          noMatch: t.jobs.noMatch,
          rows: t.common.rows,
          page: t.common.page,
        }} />
      </main>
    </>
  );
}
