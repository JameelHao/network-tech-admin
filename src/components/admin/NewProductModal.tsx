"use client";

import { useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Dict } from "@/lib/i18n/dict";

export function NewProductModal({ t, lang }: { t: Dict; lang: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-navy-700 px-3 py-1.5 text-[12.5px] text-navy-50 hover:bg-navy-600 transition-colors"
      >
        + {t.common.new}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-24">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl mx-4 rounded-lg border border-line bg-surface shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-line px-6 py-3 flex items-center justify-between z-10">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {t.product.newProduct}
              </span>
              <button onClick={() => setOpen(false)} className="text-ink-400 hover:text-ink-700 text-[18px] leading-none">&times;</button>
            </div>
            <div className="p-6">
              <ProductForm t={t} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
