import { Topbar } from "@/components/admin/Topbar";
import { listPapers } from "@/lib/admin/papers";
import { getAvailableVenues } from "@/lib/admin/paper-import";
import { getDict } from "@/lib/i18n/server";
import { PapersClient } from "./PapersClient";

export default async function PapersPage() {
  const { lang, t } = await getDict();
  const papers = await listPapers();
  const venues = getAvailableVenues();

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.papers }]} t={t} lang={lang} />
      <main className="flex-1 px-6 xl:px-10 py-10">
        <PapersClient initialPapers={papers} venues={venues} />
      </main>
    </>
  );
}
