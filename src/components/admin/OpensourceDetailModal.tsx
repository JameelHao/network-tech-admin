"use client";

import { DetailModal } from "@/components/admin/DetailModal";
import { TopicTag } from "@/components/admin/TopicTag";
import type { OpenSource } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";

export function OpensourceDetailModal({
  project,
  t,
  lang,
  onClose,
}: {
  project: OpenSource;
  t: Dict;
  lang: Lang;
  onClose: () => void;
}) {
  return (
    <DetailModal title={project.name} label={t.nav.opensource} onClose={onClose}>
      {project.description && (
        <p className="text-[13px] text-ink-600 leading-relaxed">{project.description}</p>
      )}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.language}</dt><dd className="mt-1 text-ink-800">{project.language ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.stars}</dt><dd className="mt-1 text-ink-800 tabular-nums">{project.stars?.toLocaleString() ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.lastActive}</dt><dd className="mt-1 text-ink-800 tabular-nums">{project.last_active ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.repo}</dt><dd className="mt-1">{project.repo_url ? <a href={project.repo_url} target="_blank" rel="noreferrer" className="text-navy-500 hover:text-navy-700 truncate block">{project.repo_url}</a> : "—"}</dd></div>
      </dl>
      {project.topics.length > 0 && (
        <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.detail.topics}</p><div className="flex flex-wrap gap-1.5">{project.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}</div></div>
      )}
      {project.notes && <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.notes}</p><p className="text-[13px] text-ink-600 whitespace-pre-wrap">{project.notes}</p></div>}
    </DetailModal>
  );
}
