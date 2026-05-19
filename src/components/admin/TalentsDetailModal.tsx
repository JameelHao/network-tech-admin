"use client";

import { DetailModal } from "@/components/admin/DetailModal";
import { TopicTag } from "@/components/admin/TopicTag";
import { StatusPill } from "@/components/admin/StatusPill";
import type { TalentLead } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";

export function TalentsDetailModal({ talent, t, lang, onClose }: { talent: TalentLead; t: Dict; lang: Lang; onClose: () => void }) {
  return (
    <DetailModal title={talent.name} label={t.nav.talents} onClose={onClose}>
      <div className="flex items-center gap-2">
        <StatusPill label={talent.stage} lang={lang} />
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.role}</dt><dd className="mt-1 text-ink-800">{talent.role ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.company}</dt><dd className="mt-1 text-ink-800">{talent.company ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.linkedin}</dt><dd className="mt-1">{talent.linkedin_url ? <a href={talent.linkedin_url} target="_blank" rel="noreferrer" className="text-navy-500 hover:text-navy-700 truncate block">{talent.linkedin_url}</a> : "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.source}</dt><dd className="mt-1 text-ink-800">{talent.source ?? "—"}</dd></div>
      </dl>
      {talent.topics.length > 0 && (
        <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.detail.topics}</p><div className="flex flex-wrap gap-1.5">{talent.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}</div></div>
      )}
      {talent.notes && <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.notes}</p><p className="text-[13px] text-ink-600 whitespace-pre-wrap">{talent.notes}</p></div>}
    </DetailModal>
  );
}
