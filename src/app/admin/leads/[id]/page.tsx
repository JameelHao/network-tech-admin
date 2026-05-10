import { Topbar } from "@/components/admin/Topbar";
import { StatusPill } from "@/components/admin/StatusPill";
import { getLead } from "@/lib/admin/leads";
import { getDict } from "@/lib/i18n/server";
import { notFound } from "next/navigation";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const lead = await getLead(id);
  if (!lead) notFound();

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.leads, href: "/admin/leads" },
        { label: lead.title.slice(0, 30) },
      ]} t={t} lang={lang} />
      <main className="flex-1 px-6 xl:px-10 py-10 max-w-3xl">
        <div className="rounded-lg border border-line bg-surface p-7 space-y-5">
          <div className="flex items-start justify-between">
            <h1 className="font-display text-[22px] tracking-tight text-ink-900">{lead.title}</h1>
            <StatusPill label={lead.stage} />
          </div>
          <dl className="grid grid-cols-2 gap-4 text-[13px]">
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
