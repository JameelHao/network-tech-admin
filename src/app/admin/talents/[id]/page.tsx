import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { TalentForm } from "@/components/admin/TalentForm";
import { getTalentLead } from "@/lib/admin/talents";
import { getDict } from "@/lib/i18n/server";
import { notFound } from "next/navigation";

export default async function TalentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const talent = await getTalentLead(id);
  if (!talent) notFound();

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.talents, href: "/admin/talents" },
        { label: talent.name },
      ]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <div className="max-w-3xl">
          <header className="mb-8">
            <Link href="/admin/talents" className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400 hover:text-ink-700">
              ← {t.nav.talents}
            </Link>
            <h1 className="mt-6 font-display text-[32px] leading-tight tracking-tight text-ink-900">
              {talent.name}
            </h1>
          </header>

          <div className="rounded-lg border border-line bg-surface p-6">
            <TalentForm t={t} talent={talent} />
          </div>
        </div>
      </main>
    </>
  );
}
