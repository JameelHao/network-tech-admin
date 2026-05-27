"use client";

import { DetailModal } from "@/components/admin/DetailModal";
import { TopicTag } from "@/components/admin/TopicTag";
import { relativeTime } from "@/lib/admin/format";
import type { Rfc } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";

export function RfcsDetailModal({ item, t, lang, now, onClose }: { item: Rfc; t: Dict; lang: Lang; now?: number; onClose: () => void }) {
  return (
    <DetailModal title={`RFC ${item.rfc_number}`} label={t.nav.rfcs} onClose={onClose}>
      <h3 className="text-[15px] font-semibold text-ink-900 leading-snug">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-navy-600 transition-colors">
          {item.title}
        </a>
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] mt-4">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.list.publishedAt}</dt>
          <dd className="mt-1 text-ink-800 tabular-nums font-mono text-[12px]">{item.published_at ? relativeTime(item.published_at, lang, now) : "—"}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.topics}</dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {item.topics.length > 0
              ? item.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)
              : "—"}
          </dd>
        </div>
      </dl>
      {item.companies.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.company}</p>
          <div className="flex flex-wrap gap-1">
            {item.companies.map((c) => (
              <span key={c} className="rounded-full bg-navy-50 border border-navy-200 px-2 py-0.5 font-mono text-[10px] text-navy-700">{c}</span>
            ))}
          </div>
        </div>
      )}
      {item.abstract && (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.abstract}</p>
          <p className="text-[13px] text-ink-600 leading-relaxed">{item.abstract}</p>
        </div>
      )}
      <div className="pt-4">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-navy-700 px-4 py-2 text-[12.5px] text-navy-50 hover:bg-navy-600 transition-colors"
        >
          {lang === "zh" ? "查看 RFC" : "View RFC"} &rarr;
        </a>
      </div>
    </DetailModal>
  );
}
