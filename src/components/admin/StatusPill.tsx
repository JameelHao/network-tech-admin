const STAGE_STYLE: Record<string, { bg: string; ring: string; text: string; dot: string }> = {
  new:        { bg: "bg-cobalt-50", ring: "ring-cobalt-100", text: "text-cobalt-700", dot: "bg-cobalt-500" },
  tracking:   { bg: "bg-gold-50",   ring: "ring-gold-100",   text: "text-gold-700",   dot: "bg-gold-500" },
  evaluating: { bg: "bg-navy-50",   ring: "ring-navy-100",   text: "text-navy-700",   dot: "bg-navy-500" },
  archived:   { bg: "bg-ink-50",    ring: "ring-ink-100",    text: "text-ink-600",    dot: "bg-ink-400" },
};

export function StatusPill({ label, statusLabel }: { label: string; statusLabel?: string }) {
  const style = STAGE_STYLE[label] ?? STAGE_STYLE.archived;
  return (
    <span
      role="status"
      aria-label={statusLabel ? `${statusLabel}: ${label}` : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ring-1 ${style.bg} ${style.ring} ${style.text} font-mono text-[9.5px] uppercase tracking-[0.16em]`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}
