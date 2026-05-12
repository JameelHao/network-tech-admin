"use client";

import type { HeatmapPoint } from "@/lib/admin/insights";

type Props = {
  data: HeatmapPoint[];
  xLabels: string[];
  yLabels: string[];
};

function getHeatColor(count: number, max: number): string {
  if (count === 0) return "bg-surface";
  const ratio = count / max;
  if (ratio <= 0.2) return "bg-indigo-100 dark:bg-indigo-900/30";
  if (ratio <= 0.4) return "bg-indigo-200 dark:bg-indigo-800/40";
  if (ratio <= 0.6) return "bg-indigo-300 dark:bg-indigo-700/50";
  if (ratio <= 0.8) return "bg-indigo-400 dark:bg-indigo-600/60 text-white";
  return "bg-indigo-500 dark:bg-indigo-500/70 text-white";
}

const LEGEND_STEPS = [
  "bg-indigo-100 dark:bg-indigo-900/30",
  "bg-indigo-200 dark:bg-indigo-800/40",
  "bg-indigo-300 dark:bg-indigo-700/50",
  "bg-indigo-400 dark:bg-indigo-600/60",
  "bg-indigo-500 dark:bg-indigo-500/70",
];

export function Heatmap({ data, xLabels, yLabels }: Props) {
  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  const lookup = new Map<string, number>();
  let maxCount = 1;
  for (const d of data) {
    lookup.set(`${d.topic}|${d.month}`, d.count);
    if (d.count > maxCount) maxCount = d.count;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[320px]">
        <div
          className="grid gap-px"
          style={{ gridTemplateColumns: `80px repeat(${xLabels.length}, 1fr)` }}
        >
          <div />
          {xLabels.map((x) => (
            <div
              key={x}
              className="text-center font-mono text-[9px] text-ink-400 pb-1 truncate"
            >
              {x.slice(5)}
            </div>
          ))}

          {yLabels.map((y) => (
            <div key={y} className="contents">
              <div
                className="text-right pr-2 font-mono text-[10px] text-ink-500 truncate leading-7"
                title={y}
              >
                {y}
              </div>
              {xLabels.map((x) => {
                const count = lookup.get(`${y}|${x}`) ?? 0;
                return (
                  <div
                    key={`${y}|${x}`}
                    className={`h-7 rounded-sm ${getHeatColor(count, maxCount)} transition-all duration-150 hover:scale-110 hover:shadow-md hover:z-10 relative group cursor-default`}
                  >
                    {count > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Color scale legend */}
        <div className="flex items-center justify-end gap-1.5 mt-3 px-2">
          <span className="font-mono text-[9px] text-ink-400">Less</span>
          {LEGEND_STEPS.map((cls, i) => (
            <div key={i} className={`w-4 h-4 rounded-sm ${cls}`} />
          ))}
          <span className="font-mono text-[9px] text-ink-400">More</span>
        </div>
      </div>
    </div>
  );
}
