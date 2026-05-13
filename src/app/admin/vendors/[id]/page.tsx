import { Topbar } from "@/components/admin/Topbar";
import { DetailNav } from "@/components/admin/DetailNav";
import { TopicTag } from "@/components/admin/TopicTag";
import { StatusPill } from "@/components/admin/StatusPill";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { getVendor } from "@/lib/admin/vendors";
import { getAdjacentItems } from "@/lib/admin/adjacent";
import { getDict } from "@/lib/i18n/server";
import { notFound } from "next/navigation";
import Link from "next/link";

const TYPE_I18N_MAP: Record<string, string> = {
  vendor: "vendorType",
  partner: "partner",
  competitor: "competitor",
  startup: "startup",
  academic: "academic",
};

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const [vendor, adjacent] = await Promise.all([
    getVendor(id),
    getAdjacentItems("vendors", id, "name", "created_at", false),
  ]);
  if (!vendor) notFound();

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.vendors, href: "/admin/vendors" },
        { label: vendor.name },
      ]} t={t} lang={lang} />
      <DetailNav
        backHref="/admin/vendors"
        backLabel={t.nav.vendors}
        prev={adjacent.prev}
        next={adjacent.next}
        basePath="/admin/vendors"
        labels={{ backTo: t.detail.backTo, prev: t.detail.prev, next: t.detail.next }}
      />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10 max-w-3xl w-full">
        <div className="rounded-lg border border-line bg-surface p-5 sm:p-7 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="font-sans text-[20px] sm:text-[22px] font-bold tracking-[-0.02em] text-ink-900">{vendor.name}</h1>
              <StatusPill label={vendor.stage} lang={lang} />
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/vendors/${id}/edit`}
                className="rounded-md bg-navy-700 px-3 py-1 text-[12px] text-navy-50 hover:bg-navy-600 transition-colors"
              >
                {t.vendor.editVendor}
              </Link>
              <FavoriteButton entity="vendors" id={id} label={vendor.name} />
            </div>
          </div>
          {vendor.description && <p className="text-[13px] text-ink-600">{vendor.description}</p>}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.vendor.type}</dt><dd className="mt-1 text-ink-800">{t.vendor[TYPE_I18N_MAP[vendor.type] as keyof typeof t.vendor] as string}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.vendor.hqLocation}</dt><dd className="mt-1 text-ink-800">{vendor.hq_location ?? "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.vendor.foundedYear}</dt><dd className="mt-1 text-ink-800 tabular-nums">{vendor.founded_year ?? "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.vendor.employeeRange}</dt><dd className="mt-1 text-ink-800">{vendor.employee_range ?? "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.url}</dt><dd className="mt-1">{vendor.website ? <a href={vendor.website} target="_blank" rel="noreferrer" className="text-navy-500 hover:text-navy-700 transition-colors truncate block">{vendor.website}</a> : "—"}</dd></div>
          </dl>
          {vendor.key_products.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.vendor.keyProducts}</p>
              <div className="flex flex-wrap gap-1.5">
                {vendor.key_products.map((kp) => (
                  <span key={kp} className="rounded-full bg-navy-50 px-2.5 py-0.5 text-[11px] font-medium text-navy-700">{kp}</span>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.detail.topics}</p>
            <div className="flex flex-wrap gap-1.5">
              {vendor.topics.length > 0
                ? vendor.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)
                : <span className="text-[11px] text-ink-400">—</span>
              }
            </div>
          </div>
          {vendor.notes && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.notes}</p>
              <p className="text-[13px] text-ink-600">{vendor.notes}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
