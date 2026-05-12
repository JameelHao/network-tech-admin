"use client";

type ChartTooltipProps = {
  active?: boolean;
  payload?: readonly { value?: number | string | readonly (string | number)[] }[];
  label?: string | number;
};

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl bg-slate-900/[0.92] backdrop-blur-sm text-slate-100 px-3.5 py-2.5 shadow-xl border border-white/5">
      {label != null && (
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1">
          {String(label)}
        </p>
      )}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold tabular-nums">
          {typeof p.value === "number" ? p.value.toLocaleString() : String(p.value ?? "")}
        </p>
      ))}
    </div>
  );
}
