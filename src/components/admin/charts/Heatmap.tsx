"use client";

import type { HeatmapPoint } from "@/lib/admin/insights";
import { HEATMAP_SCALE, getHeatColor } from "@/lib/admin/chart-theme";
import { getTopicLabel } from "@/lib/admin/topics";

type Props = {
  data: HeatmapPoint[];
  xLabels: string[];
  yLabels: string[];
  lang?: "en" | "zh";
};

export function Heatmap({ data, xLabels, yLabels, lang }: Props) {
  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  const lookup = new Map<string, number>();
  let maxCount = 1;
  for (const d of data) {
    lookup.set(`${d.topic}|${d.month}`, d.count);
    if (d.count > maxCount) maxCount = d.count;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[280px]">
        <div
          className="grid gap-px"
          style={{ gridTemplateColumns: `90px repeat(${xLabels.length}, 1fr)` }}
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
                title={lang ? getTopicLabel(y, lang) : y}
              >
                {lang ? getTopicLabel(y, lang) : y}
              </div>
              {xLabels.map((x) => {
                const count = lookup.get(`${y}|${x}`) ?? 0;
                const ratio = count / maxCount;
                return (
                  <div
                    key={`${y}|${x}`}
                    className="h-7 rounded-sm transition-all duration-150 hover:scale-110 hover:shadow-md hover:z-10 relative group cursor-default"
                    style={{ backgroundColor: count > 0 ? getHeatColor(ratio) : undefined }}
                  >
                    {count > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] tabular-nums text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="flex items-center justify-end gap-1 mt-3 px-2">
          <span className="font-mono text-[9px] text-ink-400 mr-0.5">Less</span>
          {HEATMAP_SCALE.map((color, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: color }} />
          ))}
          <span className="font-mono text-[9px] text-ink-400 ml-0.5">More</span>
        </div>
      </div>
    </div>
  );
}
