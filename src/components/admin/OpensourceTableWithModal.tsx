"use client";

import { useState } from "react";
import Link from "next/link";
import { TopicTag } from "@/components/admin/TopicTag";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { OpensourceDetailModal } from "@/components/admin/OpensourceDetailModal";
import type { OpenSource } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";

export function OpensourceTableWithModal({
  projects,
  t,
  lang,
}: {
  projects: OpenSource[];
  t: Dict;
  lang: Lang;
}) {
  const [selected, setSelected] = useState<OpenSource | null>(null);

  return (
    <>
      <tbody className="divide-y divide-line">
        {projects.map((o) => (
          <tr key={o.id} className="hover:bg-paper/40 transition-colors">
            <td className="px-3 sm:px-5 py-3">
              <button
                type="button"
                onClick={() => setSelected(o)}
                className="text-left w-full font-normal text-ink-800 hover:text-navy-600 transition-colors"
              >
                {o.name}
                {o.description && (
                  <p className="text-[11px] text-ink-400 mt-0.5 truncate max-w-[150px] sm:max-w-xs">{o.description}</p>
                )}
              </button>
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3 text-ink-600">{o.language ?? "—"}</td>
            <td className="px-3 sm:px-5 py-3 text-ink-600 tabular-nums whitespace-nowrap">{o.stars?.toLocaleString() ?? "—"}</td>
            <td className="px-3 sm:px-5 py-3 text-ink-600 tabular-nums whitespace-nowrap">{o.last_active ?? "—"}</td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3">
              <div className="flex flex-wrap gap-1.5">
                {o.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}
              </div>
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3">
              {o.repo_url ? (
                <a href={o.repo_url} target="_blank" rel="noopener noreferrer" className="text-navy-500 hover:text-navy-700" onClick={(e) => e.stopPropagation()}>
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor"><path d="M8 .2A8 8 0 0 0 5.47 15.79c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.42 7.42 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 8 .2Z"/></svg>
                </a>
              ) : <span className="text-ink-300">—</span>}
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3">
              <FavoriteButton entity="opensource" id={o.id} label={o.name} />
            </td>
          </tr>
        ))}
      </tbody>
      {selected && (
        <OpensourceDetailModal
          project={selected}
          t={t}
          lang={lang}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
