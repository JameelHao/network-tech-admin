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
        { label: t.common.new },
      ]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <div className="max-w-3xl">
          <header className="mb-8">
            <Link href="/admin/talents" className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400 hover:text-ink-700">
              ← {t.nav.talents}
            </Link>
            <h1 className="mt-6 font-sans text-[32px] font-bold leading-tight tracking-tight text-ink-900">
              {t.talent.newTalent}
            </h1>
          </header>

          <div className="rounded-lg border border-line bg-surface p-6">
            <TalentForm t={t} />
          </div>
        </div>
      </main>
    </>
  );
}
