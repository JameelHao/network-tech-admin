"use client";

import type { HeatmapPoint } from "@/lib/admin/insights";

type Props = {
  data: HeatmapPoint[];
  xLabels: string[];
  yLabels: string[];
};

function getColor(count: number): string {
  if (count === 0) return "bg-surface";
  if (count <= 2) return "bg-navy-500/15";
  if (count <= 5) return "bg-navy-500/35";
  return "bg-navy-500/60";
}

export function Heatmap({ data, xLabels, yLabels }: Props) {
  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  const lookup = new Map<string, number>();
  for (const d of data) {
    lookup.set(`${d.topic}|${d.month}`, d.count);
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        <div
          className="grid gap-px"
          style={{ gridTemplateColumns: `100px repeat(${xLabels.length}, 1fr)` }}
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
            <>
              <div
                key={`label-${y}`}
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
                    className={`h-7 rounded-sm ${getColor(count)} transition-colors relative group`}
                  >
                    {count > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] tabular-nums text-ink-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
