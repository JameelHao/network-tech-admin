"use client";

import { useActionState } from "react";
import type { Dict } from "@/lib/i18n/dict";
import type { Vendor } from "@/lib/admin/types";
import { VENDOR_TYPES, VENDOR_STAGES } from "@/lib/admin/types";
import { createVendorAction, updateVendorAction, deleteVendor, type VendorFormState } from "@/app/admin/vendors/actions";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="tracked-label">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const TYPE_I18N_MAP: Record<string, string> = {
  vendor: "vendorType",
  partner: "partner",
  competitor: "competitor",
  startup: "startup",
  academic: "academic",
};

export function VendorForm({ t, vendor }: { t: Dict; vendor?: Vendor }) {
  const action = vendor ? updateVendorAction : createVendorAction;
  const [state, formAction, pending] = useActionState<VendorFormState, FormData>(action, undefined);

  const inputCls = "w-full rounded-md border border-line bg-paper px-3 py-2 text-[14px] focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100";

  return (
    <form action={formAction} className="space-y-6">
      {vendor && <input type="hidden" name="id" value={vendor.id} />}

      {state?.error && (
        <div className="rounded-md border border-rust-100 bg-rust-50 px-3 py-2 text-[12.5px] text-rust-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Field label={t.common.name}>
          <input name="name" required defaultValue={vendor?.name ?? ""} placeholder={t.vendor.namePlaceholder} className={inputCls} />
        </Field>

        <Field label={t.vendor.type}>
          <select name="type" defaultValue={vendor?.type ?? "vendor"} className={inputCls}>
            {VENDOR_TYPES.map((vt) => (
              <option key={vt} value={vt}>{t.vendor[TYPE_I18N_MAP[vt] as keyof typeof t.vendor] as string}</option>
            ))}
          </select>
        </Field>

        <Field label={t.common.stage}>
          <select name="stage" defaultValue={vendor?.stage ?? "watching"} className={inputCls}>
            {VENDOR_STAGES.map((s) => (
              <option key={s} value={s}>{t.vendor[s as keyof typeof t.vendor] as string}</option>
            ))}
          </select>
        </Field>

        <Field label={t.common.url}>
          <input name="website" type="url" defaultValue={vendor?.website ?? ""} placeholder={t.vendor.websitePlaceholder} className={inputCls} />
        </Field>

        <Field label={t.vendor.hqLocation}>
          <input name="hq_location" defaultValue={vendor?.hq_location ?? ""} placeholder={t.vendor.hqLocationPlaceholder} className={inputCls} />
        </Field>

        <Field label={t.vendor.foundedYear}>
          <input name="founded_year" type="number" defaultValue={vendor?.founded_year ?? ""} placeholder={t.vendor.foundedYearPlaceholder} className={`${inputCls} font-mono`} />
        </Field>

        <Field label={t.vendor.employeeRange}>
          <input name="employee_range" defaultValue={vendor?.employee_range ?? ""} placeholder={t.vendor.employeeRangePlaceholder} className={inputCls} />
        </Field>
      </div>

      <Field label={t.vendor.keyProducts}>
        <input name="key_products" defaultValue={vendor?.key_products.join(", ") ?? ""} placeholder={t.vendor.keyProductsPlaceholder} className={inputCls} />
      </Field>

      <Field label="Description">
        <textarea name="description" rows={2} defaultValue={vendor?.description ?? ""} placeholder={t.vendor.descriptionPlaceholder} className={`${inputCls} leading-relaxed resize-y`} />
      </Field>

      <Field label={t.common.topics}>
        <input name="topics" defaultValue={vendor?.topics.join(", ") ?? ""} placeholder={t.talent.topicsPlaceholder} className={inputCls} />
      </Field>

      <Field label={t.detail.notes}>
        <textarea name="notes" rows={3} defaultValue={vendor?.notes ?? ""} placeholder={t.talent.notesPlaceholder} className={`${inputCls} leading-relaxed resize-y`} />
      </Field>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.16em]">
          {vendor ? (
            <button
              type="button"
              onClick={() => { if (confirm(t.common.confirmDelete)) deleteVendor(vendor.id); }}
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
