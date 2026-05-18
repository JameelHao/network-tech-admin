"use client";

import { getTopicCategory, getCategoryColor, getTopicLabel, type TopicCategory } from "@/lib/admin/topics";
import type { Lang } from "@/lib/i18n/dict";

const COLOR_MAP: Record<string, string> = {
  navy:   "border-navy-200 bg-navy-50 text-navy-700",
  cobalt: "border-cobalt-200 bg-cobalt-50 text-cobalt-700",
  rust:   "border-rust-200 bg-rust-50 text-rust-700",
  moss:   "border-moss-200 bg-moss-50 text-moss-700",
  amber:  "border-amber-200 bg-amber-50 text-amber-700",
  ink:    "border-line bg-surface-sunk text-ink-600",
};

export function TopicTag({ label, lang, displayLabel, category }: { label: string; lang?: Lang; displayLabel?: string; category?: TopicCategory | "other" }) {
  const resolvedCategory = category === "other" ? undefined : (category ?? getTopicCategory(label));
  const color = resolvedCategory ? getCategoryColor(resolvedCategory) : "ink";
  const classes = COLOR_MAP[color] ?? COLOR_MAP.ink;
  const text = displayLabel ?? (lang ? getTopicLabel(label, lang) : label);

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9.5px] tracking-[0.1em] ${classes}`}>
      {text}
    </span>
  );
}
