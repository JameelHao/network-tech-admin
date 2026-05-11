"use client";

import Link from "next/link";

type ActiveFilter = { label: string; value: string };

export function FilterSummary({
  filters,
  labels,
  clearHref,
  onClear,
}: {
  filters: ActiveFilter[];
  labels: { activeFilters: string; clearAll: string };
  clearHref?: string;
  onClear?: () => void;
}) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 py-2 border-b border-line bg-amber-50/40">
      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-500 shrink-0">
        {labels.activeFilters}
      </span>
      {filters.map((f, i) => (
        <span
          key={i}
          className="rounded-full bg-navy-100 px-2 py-0.5 font-mono text-[10px] text-navy-700"
        >
          {f.label}={f.value}
        </span>
      ))}
      {clearHref ? (
        <Link
          href={clearHref}
          className="ml-auto font-mono text-[10px] text-red-600 hover:text-red-800 transition-colors shrink-0"
        >
          {labels.clearAll}
        </Link>
      ) : onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="ml-auto font-mono text-[10px] text-red-600 hover:text-red-800 transition-colors shrink-0"
        >
          {labels.clearAll}
        </button>
      ) : null}
    </div>
  );
}
