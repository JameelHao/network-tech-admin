"use client";

import { DetailModal } from "@/components/admin/DetailModal";
import type { NewsItem } from "@/lib/admin/news";
import type { Dict, Lang } from "@/lib/i18n/dict";
import { relativeTime } from "@/lib/admin/format";

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
}

export function NewsDetailModal({ item, t, lang, now, onClose }: { item: NewsItem; t: Dict; lang: Lang; now?: number; onClose: () => void }) {
  return (
    <DetailModal title="News" label={t.nav.news} onClose={onClose}>
      <h3 className="text-[15px] font-semibold text-ink-900 leading-snug">
        {item.link ? (
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-navy-600 transition-colors">
            {item.title}
          </a>
        ) : item.title}
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.list.source}</dt><dd className="mt-1">{item.source ? <span className="rounded-full bg-navy-50 border border-navy-200 px-2 py-0.5 font-mono text-[10px] text-navy-700">{item.source}</span> : "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.news.domain}</dt><dd className="mt-1 text-ink-800 font-mono text-[12px]">{extractDomain(item.link)}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.list.publishedAt}</dt><dd className="mt-1 text-ink-800 tabular-nums font-mono text-[12px]">{item.pub_date ? relativeTime(item.pub_date, lang, now) : "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.news.freshness}</dt><dd className="mt-1 text-ink-800">{item.pub_date ?? "—"}</dd></div>
      </dl>
      {item.snippet && <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.news.snippet}</p><p className="text-[13px] text-ink-600 leading-relaxed">{item.snippet}</p></div>}
      <div className="pt-2">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-navy-700 px-4 py-2 text-[12.5px] text-navy-50 hover:bg-navy-600 transition-colors"
        >
          Open article &rarr;
        </a>
      </div>
    </DetailModal>
  );
}
