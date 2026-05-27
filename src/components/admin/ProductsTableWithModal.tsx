"use client";

import { useState } from "react";
import { TopicTag } from "@/components/admin/TopicTag";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { ProductsDetailModal } from "@/components/admin/ProductsDetailModal";
import type { Product } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";

export function ProductsTableWithModal({
  products,
  t,
  lang,
}: {
  products: Product[];
  t: Dict;
  lang: Lang;
}) {
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <>
      <tbody className="divide-y divide-line">
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-paper/40 transition-colors">
            <td className="px-3 sm:px-5 py-3">
              <button
                type="button"
                onClick={() => setSelected(p)}
                className="text-left w-full font-normal text-ink-800 hover:text-navy-600 transition-colors"
              >
                {p.name}
                {p.description && (
                  <p className="text-[11px] text-ink-400 mt-0.5 truncate max-w-[150px] sm:max-w-xs">{p.description}</p>
                )}
              </button>
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3 text-ink-600">{p.vendor ?? "—"}</td>
            <td className="px-3 sm:px-5 py-3 text-ink-600 whitespace-nowrap">{t.product[p.category as keyof typeof t.product] as string}</td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3 text-ink-600 font-mono text-[12px] tabular-nums">{p.published_at ? new Date(p.published_at).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "—"}</td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3">
              <div className="flex flex-wrap gap-1">
                {p.topics.length > 0
                  ? p.topics.slice(0, 3).map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)
                  : <span className="text-[11px] text-ink-400">—</span>
                }
              </div>
            </td>
            <td className="hidden lg:table-cell px-3 sm:px-5 py-3"><FavoriteButton entity="products" id={p.id} label={p.name} /></td>
          </tr>
        ))}
      </tbody>
      {selected && (
        <ProductsDetailModal
          product={selected}
          t={t}
          lang={lang}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
