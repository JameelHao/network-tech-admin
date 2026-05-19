"use client";

import { useEffect, useState } from "react";
import { DetailModal } from "@/components/admin/DetailModal";
import { TopicTag } from "@/components/admin/TopicTag";
import { relativeTime } from "@/lib/admin/format";
import { getPaperDetail } from "@/app/admin/papers/actions";
import type { Paper } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";

export function PapersDetailModal({ paper, t, lang, onClose, now }: { paper: Paper; t: Dict; lang: Lang; onClose: () => void; now?: number }) {
  const [full, setFull] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!paper.abstract && !paper.notes) {
      setLoading(true);
      getPaperDetail(paper.id).then((p) => { setFull(p); setLoading(false); });
    }
  }, [paper.id, paper.abstract, paper.notes]);

  const resolved = full ?? paper;
  const paperUrl = resolved.url || `https://scholar.google.com/scholar?q=${encodeURIComponent(resolved.title)}`;

  return (
    <DetailModal title={resolved.title} label={t.nav.papers} onClose={onClose}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {resolved.authors.length > 0 && (
          <span className="text-[13px] text-ink-600">{resolved.authors.join(", ")}</span>
        )}
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.venue}</dt><dd className="mt-1">{resolved.venue ? <span className="rounded-full bg-navy-50 border border-navy-200 px-2 py-0.5 font-mono text-[10px] text-navy-700">{resolved.venue}</span> : "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.list.publishedAt}</dt><dd className="mt-1 text-ink-800 tabular-nums font-mono text-[12px]">{resolved.published_date ? relativeTime(resolved.published_date, lang, now) : "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.papers.source}</dt><dd className="mt-1 text-ink-800">{resolved.source ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.papers.citations}</dt><dd className="mt-1 text-ink-800 tabular-nums">{resolved.citation_count?.toLocaleString() ?? "—"}</dd></div>
      </dl>
      {loading && !resolved.abstract && <p className="text-[12px] text-ink-400">Loading abstract...</p>}
      {resolved.abstract && <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.abstract}</p><p className="text-[13px] text-ink-600 leading-relaxed">{resolved.abstract}</p></div>}
      {resolved.topics.length > 0 && (
        <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.detail.topics}</p><div className="flex flex-wrap gap-1.5">{resolved.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}</div></div>
      )}
      {resolved.notes && <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.notes}</p><p className="text-[13px] text-ink-600 whitespace-pre-wrap">{resolved.notes}</p></div>}
      <div className="pt-2">
        <a
          href={paperUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-navy-700 px-4 py-2 text-[12.5px] text-navy-50 hover:bg-navy-600 transition-colors"
        >
          Open paper &rarr;
        </a>
      </div>
    </DetailModal>
  );
}
