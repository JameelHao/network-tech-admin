import { Topbar } from "@/components/admin/Topbar";
import { DetailNav } from "@/components/admin/DetailNav";
import { StatusPill } from "@/components/admin/StatusPill";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { getLead } from "@/lib/admin/leads";
import { getAdjacentItems } from "@/lib/admin/adjacent";
import { getDict } from "@/lib/i18n/server";
import { notFound } from "next/navigation";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const [lead, adjacent] = await Promise.all([
    getLead(id),
    getAdjacentItems("leads", id, "title", "updated_at", false),
  ]);
  if (!lead) notFound();

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.leads, href: "/admin/leads" },
        { label: lead.title.slice(0, 30) },
      ]} t={t} lang={lang} />
      <DetailNav
        prev={adjacent.prev}
        next={adjacent.next}
        basePath="/admin/leads"
        labels={{ backTo: t.detail.backTo, prev: t.detail.prev, next: t.detail.next }}
      />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10 max-w-3xl w-full">
        <div className="rounded-lg border border-line bg-surface p-5 sm:p-7 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-sans text-[20px] sm:text-[22px] font-bold tracking-[-0.02em] text-ink-900">{lead.title}</h1>
            <div className="flex items-center gap-2">
              <FavoriteButton entity="leads" id={id} label={lead.title} />
              <StatusPill label={lead.stage} lang={lang} />
            </div>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.sourceType}</dt><dd className="mt-1 text-ink-800">{t.sourceType[lead.source_type]}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.source}</dt><dd className="mt-1 text-ink-800">{lead.source_label ?? "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.createdAt}</dt><dd className="mt-1 text-ink-800 tabular-nums">{lead.created_at.slice(0, 10)}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.updatedAt}</dt><dd className="mt-1 text-ink-800 tabular-nums">{lead.updated_at.slice(0, 10)}</dd></div>
          </dl>
          {lead.summary && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.summary}</p>
              <p className="text-[13px] text-ink-600 leading-relaxed">{lead.summary}</p>
            </div>
          )}
          {lead.notes && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.notes}</p>
              <p className="text-[13px] text-ink-600">{lead.notes}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
