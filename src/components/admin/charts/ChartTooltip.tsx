"use client";

export function ChartTooltip({ active, payload, label, labelMap }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl bg-slate-900/[0.92] backdrop-blur-sm text-slate-100 px-3.5 py-2.5 shadow-xl border border-white/5 min-w-[120px]">
      {label != null && (
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
          {String(label)}
        </p>
      )}
      <div className="space-y-0.5">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-300">
              {p.color && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />}
              <span className="truncate max-w-[100px]">{labelMap?.[p.name] ?? p.name ?? p.dataKey ?? ""}</span>
            </span>
            <span className="text-sm font-semibold tabular-nums text-slate-50">
              {typeof p.value === "number" ? p.value.toLocaleString() : String(p.value ?? "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
