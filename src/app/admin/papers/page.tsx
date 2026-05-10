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
      <main className="flex-1 px-6 xl:px-10 py-10">
        <PapersClient papers={papers} />
      </main>
    </>
  );
}
