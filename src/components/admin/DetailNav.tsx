"use client";

import Link from "next/link";
import type { AdjacentItem } from "@/lib/admin/adjacent";

type Props = {
  prev: AdjacentItem;
  next: AdjacentItem;
  basePath: string;
  labels: { backTo: string; prev: string; next: string };
};

export function DetailNav({ prev, next, basePath, labels }: Props) {
  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 xl:px-10 py-3">
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500 hover:text-ink-800 transition-colors"
      >
        <span aria-hidden>←</span> {labels.backTo}
      </button>
      <div className="flex items-center gap-2">
        {prev ? (
          <Link
            href={`${basePath}/${prev.id}`}
            className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-[12px] text-ink-600 hover:border-line-strong hover:text-ink-800 transition-colors"
          >
            <span aria-hidden>←</span>
            <span className="max-w-[120px] truncate">{prev.label}</span>
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-[12px] text-ink-300 cursor-default">
            <span aria-hidden>←</span> {labels.prev}
          </span>
        )}
        {next ? (
          <Link
            href={`${basePath}/${next.id}`}
            className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-[12px] text-ink-600 hover:border-line-strong hover:text-ink-800 transition-colors"
          >
            <span className="max-w-[120px] truncate">{next.label}</span>
            <span aria-hidden>→</span>
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-[12px] text-ink-300 cursor-default">
            {labels.next} <span aria-hidden>→</span>
          </span>
        )}
      </div>
    </nav>
  );
}
