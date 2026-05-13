import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProduct } from "@/lib/admin/products";
import { getDict } from "@/lib/i18n/server";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.products, href: "/admin/products" },
        { label: product.name, href: `/admin/products/${id}` },
        { label: t.product.editProduct },
      ]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <div className="max-w-3xl">
          <header className="mb-8">
            <Link href={`/admin/products/${id}`} className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400 hover:text-ink-700">
              ← {product.name}
            </Link>
            <h1 className="mt-6 font-sans text-[32px] font-bold leading-tight tracking-tight text-ink-900">
              {t.product.editProduct}
            </h1>
          </header>

          <div className="rounded-lg border border-line bg-surface p-6">
            <ProductForm t={t} product={product} />
          </div>
        </div>
      </main>
    </>
  );
}
