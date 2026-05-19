"use client";

import { DetailModal } from "@/components/admin/DetailModal";
import { TopicTag } from "@/components/admin/TopicTag";
import { StatusPill } from "@/components/admin/StatusPill";
import type { Vendor } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";

const TYPE_I18N_MAP: Record<string, string> = {
  vendor: "vendorType",
  partner: "partnerType",
  competitor: "competitorType",
  startup: "startupType",
  academic: "academicType",
};

export function VendorsDetailModal({ vendor, t, lang, onClose }: { vendor: Vendor; t: Dict; lang: Lang; onClose: () => void }) {
  return (
    <DetailModal title={vendor.name} label={t.nav.vendors} onClose={onClose}>
      <div className="flex items-center gap-2">
        <StatusPill label={vendor.stage} lang={lang} />
      </div>
      {vendor.description && <p className="text-[13px] text-ink-600 leading-relaxed">{vendor.description}</p>}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.vendor.vendorType}</dt><dd className="mt-1 text-ink-800">{t.vendor[TYPE_I18N_MAP[vendor.type] as keyof typeof t.vendor] ?? vendor.type}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.vendor.hqLocation}</dt><dd className="mt-1 text-ink-800">{vendor.hq_location ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.vendor.foundedYear}</dt><dd className="mt-1 text-ink-800 tabular-nums">{vendor.founded_year ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.vendor.employeeRange}</dt><dd className="mt-1 text-ink-800">{vendor.employee_range ?? "—"}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Website</dt><dd className="mt-1">{vendor.website ? <a href={vendor.website} target="_blank" rel="noreferrer" className="text-navy-500 hover:text-navy-700 truncate block">{vendor.website}</a> : "—"}</dd></div>
      </dl>
      {vendor.key_products.length > 0 && (
        <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.vendor.keyProducts}</p><div className="flex flex-wrap gap-1.5">{vendor.key_products.map((kp) => <span key={kp} className="rounded-full bg-ink-100 px-2 py-0.5 font-mono text-[10px] text-ink-600">{kp}</span>)}</div></div>
      )}
      {vendor.topics.length > 0 && (
        <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.detail.topics}</p><div className="flex flex-wrap gap-1.5">{vendor.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}</div></div>
      )}
      {vendor.notes && <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.notes}</p><p className="text-[13px] text-ink-600 whitespace-pre-wrap">{vendor.notes}</p></div>}
    </DetailModal>
  );
}
