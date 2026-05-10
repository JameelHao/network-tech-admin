import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { TalentForm } from "@/components/admin/TalentForm";
import { getDict } from "@/lib/i18n/server";

export default async function NewTalentPage() {
  const { lang, t } = await getDict();

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.talents, href: "/admin/talents" },
        { label: lang === "zh" ? "新建" : "New" },
      ]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <div className="max-w-3xl">
          <header className="mb-8">
            <Link href="/admin/talents" className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400 hover:text-ink-700">
              ← {t.nav.talents}
            </Link>
            <h1 className="mt-6 font-display text-[32px] leading-tight tracking-tight text-ink-900">
              {lang === "zh" ? "新建人才线索" : "New Talent Lead"}
            </h1>
          </header>

          <div className="rounded-lg border border-line bg-surface p-6">
            <TalentForm lang={lang} />
          </div>
        </div>
      </main>
    </>
  );
}
