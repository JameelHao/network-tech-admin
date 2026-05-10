type Props = {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
};

export function StatCard({ label, value, sub, accent = "text-ink-900" }: Props) {
  return (
    <div className="bg-surface p-5 hover:bg-paper/30 transition-colors">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">
        {label}
      </p>
      <p className={`font-display text-[28px] tracking-tight ${accent}`}>{value}</p>
      {sub && <p className="text-[12px] text-ink-400 mt-1">{sub}</p>}
    </div>
  );
}
