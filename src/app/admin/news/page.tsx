import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";
import { NewsContent } from "./NewsContent";

export default async function NewsPage() {
  const { t, lang } = await getDict();

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.news }]} t={t} lang={lang} />
      <main className="flex-1 px-6 xl:px-10 py-10">
        <NewsContent labels={{
          title: t.news.title,
          searchPlaceholder: t.news.searchPlaceholder,
          allSources: t.news.allSources,
          noMatch: t.news.noMatch,
        }} />
      </main>
    </>
  );
}
