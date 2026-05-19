import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";
import { FavoritesClient } from "./FavoritesClient";

export default async function FavoritesPage() {
  const { lang, t } = await getDict();
  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.favorite.favorites }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
            {t.favorite.favorites}
          </p>
        </header>
        <FavoritesClient t={t} lang={lang} />
      </main>
    </>
  );
}
