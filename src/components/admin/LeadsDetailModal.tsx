"use client";

import { DetailModal } from "@/components/admin/DetailModal";
import { StatusPill } from "@/components/admin/StatusPill";
import type { Lead } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";

export function LeadsDetailModal({ lead, t, lang, onClose }: { lead: Lead; t: Dict; lang: Lang; onClose: () => void }) {
  return (
    <DetailModal title={lead.title} label={t.nav.leads} onClose={onClose}>
      <div className="flex items-center gap-2">
        <StatusPill label={lead.stage} lang={lang} />
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.sourceType}</dt><dd className="mt-1">{t.sourceType[lead.source_type] ?? lead.source_type}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.source}</dt><dd className="mt-1 text-ink-800">{lead.source_label ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.list.createdAt}</dt><dd className="mt-1 text-ink-800 tabular-nums">{lead.created_at?.slice(0, 10) ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.list.updatedAt}</dt><dd className="mt-1 text-ink-800 tabular-nums">{lead.updated_at?.slice(0, 10) ?? "—"}</dd></div>
      </dl>
      {lead.summary && <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.summary}</p><p className="text-[13px] text-ink-600 leading-relaxed">{lead.summary}</p></div>}
      {lead.notes && <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.notes}</p><p className="text-[13px] text-ink-600 whitespace-pre-wrap">{lead.notes}</p></div>}
    </DetailModal>
  );
}
