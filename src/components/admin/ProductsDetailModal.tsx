"use client";

import { DetailModal } from "@/components/admin/DetailModal";
import { TopicTag } from "@/components/admin/TopicTag";
import { StatusPill } from "@/components/admin/StatusPill";
import type { Product } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";

const pricingKey: Record<string, keyof Dict["product"]> = {
  free: "free",
  freemium: "freemium",
  paid: "paid",
  enterprise: "enterprise",
  "open-source": "openSource",
  unknown: "unknown",
};

const categoryKey: Record<string, keyof Dict["product"]> = {
  platform: "platform",
  tool: "tool",
  hardware: "hardware",
  saas: "saas",
  library: "library",
  other: "other",
};

export function ProductsDetailModal({ product, t, lang, onClose }: { product: Product; t: Dict; lang: Lang; onClose: () => void }) {
  return (
    <DetailModal title={product.name} label={t.nav.products} onClose={onClose}>
      <div className="flex items-center gap-2">
        <StatusPill label={product.stage} lang={lang} />
      </div>
      {product.description && <p className="text-[13px] text-ink-600 leading-relaxed">{product.description}</p>}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.vendor}</dt><dd className="mt-1 text-ink-800">{product.vendor ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.product.category}</dt><dd className="mt-1 text-ink-800">{t.product[product.category]}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.product.pricing}</dt><dd className="mt-1 text-ink-800">{t.product[pricingKey[product.pricing] ?? "unknown"]}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.product.latestVersion}</dt><dd className="mt-1 text-ink-800 font-mono">{product.latest_version ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.product.releaseDate}</dt><dd className="mt-1 text-ink-800 tabular-nums">{product.release_date ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">URL</dt><dd className="mt-1">{product.url ? <a href={product.url} target="_blank" rel="noreferrer" className="text-navy-500 hover:text-navy-700 truncate block">{product.url}</a> : "—"}</dd></div>
        {product.changelog_url && <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.product.changelogUrl}</dt><dd className="mt-1"><a href={product.changelog_url} target="_blank" rel="noreferrer" className="text-navy-500 hover:text-navy-700 truncate block">{product.changelog_url}</a></dd></div>}
      </dl>
      {product.topics.length > 0 && (
        <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.detail.topics}</p><div className="flex flex-wrap gap-1.5">{product.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}</div></div>
      )}
      {product.notes && <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.notes}</p><p className="text-[13px] text-ink-600 whitespace-pre-wrap">{product.notes}</p></div>}
    </DetailModal>
  );
}
