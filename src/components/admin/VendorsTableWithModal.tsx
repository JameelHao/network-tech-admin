"use client";

import { useState } from "react";
import { TopicTag } from "@/components/admin/TopicTag";
import { StatusPill } from "@/components/admin/StatusPill";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { VendorsDetailModal } from "@/components/admin/VendorsDetailModal";
import type { Vendor } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";

const TYPE_I18N_MAP: Record<string, string> = {
  vendor: "vendorType",
  partner: "partner",
  competitor: "competitor",
  startup: "startup",
  academic: "academic",
};

export function VendorsTableWithModal({
  vendors,
  t,
  lang,
}: {
  vendors: Vendor[];
  t: Dict;
  lang: Lang;
}) {
  const [selected, setSelected] = useState<Vendor | null>(null);

  return (
    <>
      <tbody className="divide-y divide-line">
        {vendors.map((v) => (
          <tr key={v.id} className="hover:bg-paper/40 transition-colors">
            <td className="px-3 sm:px-5 py-3">
              <button
                type="button"
                onClick={() => setSelected(v)}
                className="text-left w-full font-normal text-ink-800 hover:text-navy-600 transition-colors"
              >
                {v.name}
                {v.description && (
                  <p className="text-[11px] text-ink-400 mt-0.5 truncate max-w-[150px] sm:max-w-xs">{v.description}</p>
                )}
              </button>
            </td>
            <td className="px-3 sm:px-5 py-3 text-ink-600 whitespace-nowrap">{t.vendor[TYPE_I18N_MAP[v.type] as keyof typeof t.vendor] as string}</td>
            <td className="px-3 sm:px-5 py-3 whitespace-nowrap">
              <StatusPill label={v.stage} lang={lang} />
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3 text-ink-600 tabular-nums">{v.founded_year ?? "—"}</td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3 text-ink-600">{v.hq_location ?? "—"}</td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3">
              <div className="flex flex-wrap gap-1">
                {v.topics.length > 0
                  ? v.topics.slice(0, 3).map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)
                  : <span className="text-[11px] text-ink-400">—</span>
                }
              </div>
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3"><FavoriteButton entity="vendors" id={v.id} label={v.name} /></td>
          </tr>
        ))}
      </tbody>
      {selected && (
        <VendorsDetailModal
          vendor={selected}
          t={t}
          lang={lang}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
