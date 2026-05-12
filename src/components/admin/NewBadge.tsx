export function NewBadge({ label }: { label: string }) {
  return (
    <span className="shrink-0 rounded-full bg-emerald-100 text-emerald-700 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]">
      {label}
    </span>
  );
}
