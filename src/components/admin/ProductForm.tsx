"use client";

import { useActionState } from "react";
import type { Dict } from "@/lib/i18n/dict";
import type { Product } from "@/lib/admin/types";
import { PRODUCT_CATEGORIES, PRODUCT_PRICING, PRODUCT_STAGES } from "@/lib/admin/types";
import { createProductAction, updateProductAction, deleteProduct, type ProductFormState } from "@/app/admin/products/actions";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="tracked-label">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function ProductForm({ t, product }: { t: Dict; product?: Product }) {
  const action = product ? updateProductAction : createProductAction;
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, undefined);

  const inputCls = "w-full rounded-md border border-line bg-paper px-3 py-2 text-[14px] focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100";

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      {state?.error && (
        <div className="rounded-md border border-rust-100 bg-rust-50 px-3 py-2 text-[12.5px] text-rust-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Field label={t.common.name}>
          <input name="name" required defaultValue={product?.name ?? ""} placeholder={t.product.namePlaceholder} className={inputCls} />
        </Field>

        <Field label={t.product.category}>
          <select name="category" defaultValue={product?.category ?? "other"} className={inputCls}>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{t.product[c as keyof typeof t.product] as string}</option>
            ))}
          </select>
        </Field>

        <Field label={t.vendor.title}>
          <input name="vendor" defaultValue={product?.vendor ?? ""} placeholder={t.product.vendorPlaceholder} className={inputCls} />
        </Field>

        <Field label={t.product.pricing}>
          <select name="pricing" defaultValue={product?.pricing ?? "unknown"} className={inputCls}>
            {PRODUCT_PRICING.map((p) => (
              <option key={p} value={p}>{t.product[p === "open-source" ? "openSource" : p as keyof typeof t.product] as string}</option>
            ))}
          </select>
        </Field>

        <Field label={t.common.stage}>
          <select name="stage" defaultValue={product?.stage ?? "watching"} className={inputCls}>
            {PRODUCT_STAGES.map((s) => (
              <option key={s} value={s}>{t.product[s as keyof typeof t.product] as string}</option>
            ))}
          </select>
        </Field>

        <Field label={t.product.latestVersion}>
          <input name="latest_version" defaultValue={product?.latest_version ?? ""} placeholder={t.product.versionPlaceholder} className={inputCls} />
        </Field>

        <Field label={t.product.releaseDate}>
          <input name="release_date" type="date" defaultValue={product?.release_date ?? ""} className={`${inputCls} font-mono`} />
        </Field>

        <Field label={t.common.url}>
          <input name="url" type="url" defaultValue={product?.url ?? ""} placeholder={t.product.urlPlaceholder} className={inputCls} />
        </Field>

        <Field label={t.product.changelogUrl}>
          <input name="changelog_url" type="url" defaultValue={product?.changelog_url ?? ""} placeholder={t.product.changelogUrlPlaceholder} className={inputCls} />
        </Field>
      </div>

      <Field label={t.detail.description ?? "Description"}>
        <textarea name="description" rows={2} defaultValue={product?.description ?? ""} placeholder={t.product.descriptionPlaceholder} className={`${inputCls} leading-relaxed resize-y`} />
      </Field>

      <Field label={t.common.topics}>
        <input name="topics" defaultValue={product?.topics.join(", ") ?? ""} placeholder={t.talent.topicsPlaceholder} className={inputCls} />
      </Field>

      <Field label={t.detail.notes}>
        <textarea name="notes" rows={3} defaultValue={product?.notes ?? ""} placeholder={t.talent.notesPlaceholder} className={`${inputCls} leading-relaxed resize-y`} />
      </Field>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.16em]">
          {product ? (
            <button
              type="button"
              onClick={() => { if (confirm(t.common.confirmDelete)) deleteProduct(product.id); }}
              className="text-rust-600 hover:text-rust-800 transition-colors"
            >
              {t.common.delete}
            </button>
          ) : (
            <span className="text-ink-400">{t.common.new}</span>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-navy-700 px-4 py-1.5 text-[12.5px] text-navy-50 hover:bg-navy-600 disabled:opacity-60"
        >
          {pending ? "..." : t.common.save}
        </button>
      </div>
    </form>
  );
}
