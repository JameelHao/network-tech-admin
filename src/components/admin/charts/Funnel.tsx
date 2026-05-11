"use client";

import type { ChartPoint } from "@/lib/admin/insights";

const STAGE_COLORS: Record<string, string> = {
  new: "bg-blue-500",
  tracking: "bg-amber-500",
  evaluating: "bg-emerald-500",
  archived: "bg-ink-400",
};

type Props = {
  data: ChartPoint[];
};

export function Funnel({ data }: Props) {
  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {data.map((item) => {
        const pct = Math.round((item.value / max) * 100);
        const colorClass = STAGE_COLORS[item.name] ?? "bg-navy-500";
        return (
          <div key={item.name} className="flex items-center gap-3">
            <span className="w-20 text-right text-xs font-medium text-ink-500 capitalize shrink-0">
              {item.name}
            </span>
            <div className="flex-1 h-7 rounded bg-surface-alt overflow-hidden">
              <div
                className={`h-full rounded ${colorClass} transition-all`}
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
            <span className="w-10 text-xs tabular-nums text-ink-600 shrink-0">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
