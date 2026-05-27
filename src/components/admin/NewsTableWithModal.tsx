"use client";

import { useState } from "react";
import { NewBadge } from "@/components/admin/NewBadge";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { NewsDetailModal } from "@/components/admin/NewsDetailModal";
import { relativeTime, isNew, isExpired } from "@/lib/admin/format";
import type { NewsItem } from "@/lib/admin/news";
import type { Dict, Lang } from "@/lib/i18n/dict";

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
}

export function NewsTableWithModal({
  items,
  t,
  lang,
  now,
}: {
  items: NewsItem[];
  t: Dict;
  lang: Lang;
  now?: number;
}) {
  const [selected, setSelected] = useState<NewsItem | null>(null);

  return (
    <>
      <tbody>
        {items.map((item) => {
          const stale = isExpired(item.pub_date, 7, now);
          const isNewItem = isNew(item.pub_date, now);
          return (
            <tr key={item.id} data-fav="false" className={`group border-b border-line last:border-b-0 hover:bg-paper/40 transition-colors ${stale ? "opacity-50" : ""}`}>
              <td className="px-3 sm:px-4 py-3 align-middle">
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`text-left w-full font-normal line-clamp-2 max-w-full sm:max-w-[300px] hover:text-navy-700 ${stale ? "text-ink-500" : "text-ink-800"}`}
                >
                  <span className="text-[13px]">{item.title}</span>
                </button>
              </td>
              <td className="px-3 sm:px-4 py-3 align-middle">
                {item.source ? (
                  <span className="rounded-full bg-navy-50 border border-navy-200 px-2 py-0.5 font-mono text-[10px] text-navy-700">
                    {item.source}
                  </span>
                ) : <span className="text-ink-400">—</span>}
              </td>
              <td className="hidden lg:table-cell px-3 sm:px-4 py-3 align-middle">
                <span className="font-mono text-[11px] text-ink-500">{extractDomain(item.link)}</span>
              </td>
              <td className="hidden lg:table-cell px-3 sm:px-4 py-3 align-middle">
                <span className="text-[12px] text-ink-400">—</span>
              </td>
              <td className="px-3 sm:px-4 py-3 align-middle whitespace-nowrap">
                {item.pub_date ? (
                  <span className="font-mono text-[11.5px] tabular-nums text-ink-700" title={item.pub_date}>
                    {relativeTime(item.pub_date, lang, now)}
                  </span>
                ) : <span className="text-ink-400">—</span>}
              </td>
              <td className="hidden lg:table-cell px-3 sm:px-4 py-3 align-middle">
                {item.snippet ? (
                  <span className="text-[12px] text-ink-500 line-clamp-1 max-w-full sm:max-w-[200px] block" title={item.snippet}>
                    {item.snippet}
                  </span>
                ) : <span className="text-ink-400">—</span>}
              </td>
              <td className="hidden lg:table-cell px-3 sm:px-4 py-3 align-middle">
                {isNewItem ? (
                  <NewBadge label={t.time.new} />
                ) : stale ? (
                  <span className="rounded-full bg-ink-100 px-1.5 py-0.5 font-mono text-[9px] text-ink-500 uppercase tracking-[0.1em]">
                    {t.list.expired}
                  </span>
                ) : null}
              </td>
              <td className="px-3 sm:px-4 py-3 align-middle"><FavoriteButton entity="news" id={item.id} label={item.title} /></td>
            </tr>
          );
        })}
      </tbody>
      {selected && (
        <NewsDetailModal
          item={selected}
          t={t}
          lang={lang}
          now={now}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
