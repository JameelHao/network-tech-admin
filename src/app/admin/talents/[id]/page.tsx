import { Topbar } from "@/components/admin/Topbar";
import { DetailNav } from "@/components/admin/DetailNav";
import { TalentForm } from "@/components/admin/TalentForm";
import { getTalentLead } from "@/lib/admin/talents";
import { getAdjacentItems } from "@/lib/admin/adjacent";
import { getDict } from "@/lib/i18n/server";
import { notFound } from "next/navigation";

export default async function TalentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const [talent, adjacent] = await Promise.all([
    getTalentLead(id),
    getAdjacentItems("talent_leads", id, "name", "created_at", false),
  ]);
  if (!talent) notFound();

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.talents, href: "/admin/talents" },
        { label: talent.name },
      ]} t={t} lang={lang} />
      <DetailNav
        backHref="/admin/talents"
        backLabel={t.nav.talents}
        prev={adjacent.prev}
        next={adjacent.next}
        basePath="/admin/talents"
        labels={{ backTo: t.detail.backTo, prev: t.detail.prev, next: t.detail.next }}
      />
      <main className="px-4 sm:px-6 xl:px-10 py-6 sm:py-10">
        <div className="max-w-3xl">
          <h1 className="mb-8 font-display text-[32px] leading-tight tracking-tight text-ink-900">
            {talent.name}
          </h1>

          <div className="rounded-lg border border-line bg-surface p-6">
            <TalentForm t={t} talent={talent} />
          </div>
        </div>
      </main>
    </>
  );
}
