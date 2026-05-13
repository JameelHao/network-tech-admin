import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { VendorForm } from "@/components/admin/VendorForm";
import { getVendor } from "@/lib/admin/vendors";
import { getDict } from "@/lib/i18n/server";
import { notFound } from "next/navigation";

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const vendor = await getVendor(id);
  if (!vendor) notFound();

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.vendors, href: "/admin/vendors" },
        { label: vendor.name, href: `/admin/vendors/${id}` },
        { label: t.vendor.editVendor },
      ]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <div className="max-w-3xl">
          <header className="mb-8">
            <Link href={`/admin/vendors/${id}`} className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400 hover:text-ink-700">
              ← {vendor.name}
            </Link>
            <h1 className="mt-6 font-sans text-[32px] font-bold leading-tight tracking-tight text-ink-900">
              {t.vendor.editVendor}
            </h1>
          </header>

          <div className="rounded-lg border border-line bg-surface p-6">
            <VendorForm t={t} vendor={vendor} />
          </div>
        </div>
      </main>
    </>
  );
}
