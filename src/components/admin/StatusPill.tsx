import type { Lang } from "@/lib/i18n/dict";

const STAGE_STYLE: Record<string, { bg: string; ring: string; text: string; dot: string }> = {
  new:        { bg: "bg-cobalt-50", ring: "ring-cobalt-100", text: "text-cobalt-700", dot: "bg-cobalt-500" },
  tracking:   { bg: "bg-gold-50",   ring: "ring-gold-100",   text: "text-gold-700",   dot: "bg-gold-500" },
  evaluating: { bg: "bg-navy-50",   ring: "ring-navy-100",   text: "text-navy-700",   dot: "bg-navy-500" },
  archived:   { bg: "bg-ink-50",    ring: "ring-ink-100",    text: "text-ink-600",    dot: "bg-ink-400" },
};

const STAGE_LABELS: Record<string, Record<Lang, string>> = {
  new:        { en: "New",        zh: "新建" },
  tracking:   { en: "Tracking",   zh: "跟踪中" },
  evaluating: { en: "Evaluating", zh: "评估中" },
  archived:   { en: "Archived",   zh: "已归档" },
};

export function StatusPill({ label, lang, statusLabel }: { label: string; lang?: Lang; statusLabel?: string }) {
  const style = STAGE_STYLE[label] ?? STAGE_STYLE.archived;
  const display = lang ? (STAGE_LABELS[label]?.[lang] ?? label) : label;
  return (
    <span
      role="status"
      aria-label={statusLabel ? `${statusLabel}: ${display}` : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ring-1 ${style.bg} ${style.ring} ${style.text} font-mono text-[9.5px] uppercase tracking-[0.16em]`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {display}
    </span>
  );
}
