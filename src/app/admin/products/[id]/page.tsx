import { Topbar } from "@/components/admin/Topbar";
import { DetailNav } from "@/components/admin/DetailNav";
import { TopicTag } from "@/components/admin/TopicTag";
import { StatusPill } from "@/components/admin/StatusPill";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { getProduct } from "@/lib/admin/products";
import { getAdjacentItems } from "@/lib/admin/adjacent";
import { getDict } from "@/lib/i18n/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const [product, adjacent] = await Promise.all([
    getProduct(id),
    getAdjacentItems("products", id, "name", "created_at", false),
  ]);
  if (!product) notFound();

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.products, href: "/admin/products" },
        { label: product.name },
      ]} t={t} lang={lang} />
      <DetailNav
        prev={adjacent.prev}
        next={adjacent.next}
        basePath="/admin/products"
        labels={{ backTo: t.detail.backTo, prev: t.detail.prev, next: t.detail.next }}
      />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10 max-w-3xl w-full">
        <div className="rounded-lg border border-line bg-surface p-5 sm:p-7 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="font-sans text-[20px] sm:text-[22px] font-bold tracking-[-0.02em] text-ink-900">{product.name}</h1>
              <StatusPill label={product.stage} lang={lang} />
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/products/${id}/edit`}
                className="rounded-md bg-navy-700 px-3 py-1 text-[12px] text-navy-50 hover:bg-navy-600 transition-colors"
              >
                {t.product.editProduct}
              </Link>
              <FavoriteButton entity="products" id={id} label={product.name} />
            </div>
          </div>
          {product.description && <p className="text-[13px] text-ink-600">{product.description}</p>}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.vendor.title}</dt><dd className="mt-1 text-ink-800">{product.vendor ?? "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.product.category}</dt><dd className="mt-1 text-ink-800">{t.product[product.category as keyof typeof t.product] as string}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.product.pricing}</dt><dd className="mt-1 text-ink-800">{t.product[product.pricing === "open-source" ? "openSource" : product.pricing as keyof typeof t.product] as string}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.product.latestVersion}</dt><dd className="mt-1 text-ink-800 font-mono">{product.latest_version ?? "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.product.releaseDate}</dt><dd className="mt-1 text-ink-800 tabular-nums">{product.release_date ?? "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.url}</dt><dd className="mt-1">{product.url ? <a href={product.url} target="_blank" rel="noreferrer" className="text-navy-500 hover:text-navy-700 transition-colors truncate block">{product.url}</a> : "—"}</dd></div>
            {product.changelog_url && (
              <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.product.changelogUrl}</dt><dd className="mt-1"><a href={product.changelog_url} target="_blank" rel="noreferrer" className="text-navy-500 hover:text-navy-700 transition-colors truncate block">{product.changelog_url}</a></dd></div>
            )}
          </dl>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.detail.topics}</p>
            <div className="flex flex-wrap gap-1.5">
              {product.topics.length > 0
                ? product.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)
                : <span className="text-[11px] text-ink-400">—</span>
              }
            </div>
          </div>
          {product.notes && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.notes}</p>
              <p className="text-[13px] text-ink-600">{product.notes}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
