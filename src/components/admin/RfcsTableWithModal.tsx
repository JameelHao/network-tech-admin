"use client";

import { useState } from "react";
import { TopicTag } from "@/components/admin/TopicTag";
import { RfcsDetailModal } from "@/components/admin/RfcsDetailModal";
import { relativeTime } from "@/lib/admin/format";
import type { Rfc } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";

export function RfcsTableWithModal({
  items,
  t,
  lang,
  now,
}: {
  items: Rfc[];
  t: Dict;
  lang: Lang;
  now?: number;
}) {
  const [selected, setSelected] = useState<Rfc | null>(null);

  return (
    <>
      <tbody className="divide-y divide-line">
        {items.map((item) => (
          <tr key={item.id} className="hover:bg-paper/40 transition-colors">
            <td className="px-3 sm:px-4 py-3 font-mono text-[12px] text-ink-500 tabular-nums">
              RFC {item.rfc_number}
            </td>
            <td className="px-3 sm:px-4 py-3">
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="text-left w-full font-normal text-ink-800 hover:text-navy-600 transition-colors"
              >
                <span className="text-[13px]">{item.title}</span>
              </button>
            </td>
            <td className="px-3 sm:px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {item.topics.length > 0
                  ? item.topics.slice(0, 3).map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)
                  : <span className="text-[11px] text-ink-400">—</span>
                }
              </div>
            </td>
            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
              <span className="font-mono text-[11.5px] tabular-nums text-ink-600">
                {item.published_at ? relativeTime(item.published_at, lang, now) : "—"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
      {selected && (
        <RfcsDetailModal
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
