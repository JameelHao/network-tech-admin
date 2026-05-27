"use client";

import { useState } from "react";
import { StatusPill } from "@/components/admin/StatusPill";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { LeadsDetailModal } from "@/components/admin/LeadsDetailModal";
import { relativeTime } from "@/lib/admin/format";
import type { Lead } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";

export function LeadsTableWithModal({
  leads,
  t,
  lang,
  now,
}: {
  leads: Lead[];
  t: Dict;
  lang: Lang;
  now?: number;
}) {
  const [selected, setSelected] = useState<Lead | null>(null);

  return (
    <>
      <tbody className="divide-y divide-line">
        {leads.map((l) => (
          <tr key={l.id} data-fav={true} className="hover:bg-paper/40 transition-colors">
            <td className="px-3 sm:px-4 py-3">
              <button
                type="button"
                onClick={() => setSelected(l)}
                className="text-left w-full font-normal text-ink-800 hover:text-navy-600 transition-colors"
              >
                <span className="text-[13px] line-clamp-1 max-w-full sm:max-w-[240px] block">{l.title}</span>
              </button>
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-4 py-3">
              {l.summary ? (
                <span className="text-[12px] text-ink-500 line-clamp-1 max-w-full sm:max-w-[200px] block" title={l.summary}>
                  {l.summary}
                </span>
              ) : <span className="text-ink-400">—</span>}
            </td>
            <td className="px-3 sm:px-4 py-3">
              <span className="rounded-full bg-ink-100 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-600">
                {t.sourceType[l.source_type]}
              </span>
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-4 py-3">
              {l.source_label ? (
                <span className="text-[12px] text-ink-600">{l.source_label}</span>
              ) : <span className="text-ink-400">—</span>}
            </td>
            <td className="px-3 sm:px-4 py-3">
              <StatusPill label={l.stage} lang={lang} />
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-4 py-3">
              {l.notes ? (
                <span className="text-[12px] text-ink-500 line-clamp-1 max-w-full sm:max-w-[200px] block" title={l.notes}>
                  {l.notes}
                </span>
              ) : <span className="text-ink-400">—</span>}
            </td>
            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
              <button
                type="button"
                onClick={() => setSelected(l)}
                className="text-left w-full font-normal"
              >
                <span className="font-mono text-[11.5px] tabular-nums text-ink-700" title={l.created_at}>
                  {relativeTime(l.created_at, lang, now)}
                </span>
              </button>
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-4 py-3 whitespace-nowrap">
              <span className="font-mono text-[11.5px] tabular-nums text-ink-700" title={l.updated_at}>
                {relativeTime(l.updated_at, lang, now)}
              </span>
            </td>
            <td className="px-3 sm:px-4 py-3"><FavoriteButton entity="leads" id={l.id} label={l.title} /></td>
          </tr>
        ))}
      </tbody>
      {selected && (
        <LeadsDetailModal
          lead={selected}
          t={t}
          lang={lang}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
