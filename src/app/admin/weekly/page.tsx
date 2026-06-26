import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";
import { WeeklyClient } from "./WeeklyClient";

export const dynamic = "force-dynamic";

export default async function WeeklyPage() {
  const { lang, t } = await getDict();

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: "Weekly Report" },
      ]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <WeeklyClient lang={lang} />
      </main>
    </>
  );
}
