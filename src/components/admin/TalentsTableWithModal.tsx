"use client";

import { useState } from "react";
import { TopicTag } from "@/components/admin/TopicTag";
import { StatusPill } from "@/components/admin/StatusPill";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { TalentsDetailModal } from "@/components/admin/TalentsDetailModal";
import type { TalentLead } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";

export function TalentsTableWithModal({
  talents,
  t,
  lang,
}: {
  talents: TalentLead[];
  t: Dict;
  lang: Lang;
}) {
  const [selected, setSelected] = useState<TalentLead | null>(null);

  return (
    <>
      <tbody className="divide-y divide-line">
        {talents.map((tl) => (
          <tr key={tl.id} className="hover:bg-paper/40 transition-colors">
            <td className="px-3 sm:px-5 py-3">
              <button
                type="button"
                onClick={() => setSelected(tl)}
                className="text-left w-full font-normal text-ink-800 hover:text-navy-600 transition-colors"
              >
                {tl.name}
              </button>
            </td>
            <td className="px-3 sm:px-5 py-3 text-ink-600">{tl.role ?? "—"}</td>
            <td className="px-3 sm:px-5 py-3 text-ink-600">{tl.company ?? "—"}</td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3 text-ink-600 text-[12px]">{tl.source ?? "—"}</td>
            <td className="px-3 sm:px-5 py-3 whitespace-nowrap">
              <StatusPill label={tl.stage} lang={lang} />
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3">
              <div className="flex flex-wrap gap-1">
                {tl.topics.length > 0
                  ? tl.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)
                  : <span className="text-[11px] text-ink-400">—</span>
                }
              </div>
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3">
              {tl.linkedin_url ? (
                <a href={tl.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-navy-500 hover:text-navy-700" onClick={(e) => e.stopPropagation()}>
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor"><path d="M13.6 1H2.4C1.6 1 1 1.6 1 2.4v11.2c0 .8.6 1.4 1.4 1.4h11.2c.8 0 1.4-.6 1.4-1.4V2.4c0-.8-.6-1.4-1.4-1.4ZM5.4 13H3.2V6.4h2.2V13ZM4.3 5.5c-.7 0-1.3-.6-1.3-1.3s.6-1.3 1.3-1.3 1.3.6 1.3 1.3-.6 1.3-1.3 1.3ZM13 13h-2.2V9.8c0-.8 0-1.8-1.1-1.8s-1.3.8-1.3 1.7V13H6.2V6.4h2.1v.9c.3-.6 1-1.1 2.1-1.1 2.2 0 2.6 1.5 2.6 3.4V13Z"/></svg>
                </a>
              ) : <span className="text-ink-300">—</span>}
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3"><FavoriteButton entity="talents" id={tl.id} label={tl.name} /></td>
          </tr>
        ))}
      </tbody>
      {selected && (
        <TalentsDetailModal
          talent={selected}
          t={t}
          lang={lang}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
