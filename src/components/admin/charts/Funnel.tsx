"use client";

import type { ChartPoint } from "@/lib/admin/insights";
import { STAGE_GRADIENTS } from "@/lib/admin/chart-theme";

type Props = {
  data: ChartPoint[];
};

export function Funnel({ data }: Props) {
  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  const max = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-2.5">
      {data.map((item, idx) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        const widthPct = Math.max(Math.round((item.value / max) * 100), 2);
        const grad = STAGE_GRADIENTS[item.name] ?? STAGE_GRADIENTS.new;
        return (
          <div key={item.name} className="flex items-center gap-3">
            <span className="w-20 text-right text-xs font-medium text-ink-500 capitalize shrink-0">
              {item.name}
            </span>
            <div className="flex-1 h-8 rounded-lg bg-surface-alt overflow-hidden">
              <div
                className="h-full rounded-lg"
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, ${grad.start}, ${grad.end})`,
                  animation: `funnel-slide-in 0.8s ease-out ${idx * 0.1}s both`,
                }}
              />
            </div>
            <span className="w-16 text-xs tabular-nums text-ink-600 shrink-0">
              {item.value} <span className="text-ink-400">({pct}%)</span>
            </span>
          </div>
        );
      })}
      <style>{`
        @keyframes funnel-slide-in {
          from { width: 0; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
