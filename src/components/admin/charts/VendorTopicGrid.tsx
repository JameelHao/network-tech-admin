"use client";

import type { VendorTopicCell } from "@/lib/admin/ecosystem-stats";
import { getTopicLabel } from "@/lib/admin/topics";
import { CHART_COLORS } from "@/lib/admin/chart-theme";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  data: VendorTopicCell[];
  lang: "en" | "zh";
};

const PRODUCT_COLOR = CHART_COLORS.primary.start;
const TOPIC_ONLY_COLOR = CHART_COLORS.primary.end;

export function VendorTopicGrid({ data, lang }: Props) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const allTopics = useMemo(() => {
    const set = new Set<string>();
    for (const v of data) for (const t of v.topics) set.add(t);
    return Array.from(set).sort();
  }, [data]);

  if (!data.length || !allTopics.length) return <p className="text-ink-400 text-sm">No data</p>;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Header */}
        <div className="flex border-b border-line pb-1.5 mb-1">
          <div className="w-[120px] shrink-0" />
          {allTopics.map((t) => (
            <div
              key={t}
              className="flex-1 min-w-[36px] text-center font-mono text-[9px] text-ink-400 truncate px-0.5"
              title={getTopicLabel(t, lang)}
            >
              {getTopicLabel(t, lang).slice(0, 6)}
            </div>
          ))}
        </div>

        {/* Rows */}
        {data.map((v) => (
          <div key={v.vendorId} className="flex items-center border-b border-line/50 hover:bg-paper/30 transition-colors" style={{ minHeight: 36 }}>
            <div className="w-[120px] shrink-0 px-2 text-[12px] text-ink-700 truncate">
              <Link href={`/admin/vendors/${v.vendorId}`} className="hover:text-navy-600 transition-colors">{v.vendorName}</Link>
            </div>
            {allTopics.map((t) => {
              const has = v.topics.includes(t);
              const productNames = Object.entries(v.productTopics)
                .filter(([, topics]) => topics.includes(t))
                .map(([name]) => name);
              const hasProduct = productNames.length > 0;
              const cellKey = `${v.vendorId}-${t}`;
              const isHovered = hoveredCell === cellKey;

              return (
                <div
                  key={t}
                  className="flex-1 min-w-[36px] flex items-center justify-center relative"
                  onMouseEnter={() => has ? setHoveredCell(cellKey) : undefined}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {has && (
                    <>
                      <svg width={hasProduct ? 20 : 12} height={hasProduct ? 20 : 12}>
                        <circle
                          cx={hasProduct ? 10 : 6}
                          cy={hasProduct ? 10 : 6}
                          r={hasProduct ? 9 : 5}
                          fill={hasProduct ? PRODUCT_COLOR : TOPIC_ONLY_COLOR}
                          opacity={0.85}
                        />
                      </svg>
                      {isHovered && (
                        <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1 rounded-xl bg-slate-900/[0.92] backdrop-blur-sm text-slate-100 px-3 py-2 shadow-xl border border-white/5 whitespace-nowrap pointer-events-none">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">
                            {v.vendorName} · {getTopicLabel(t, lang)}
                          </p>
                          {hasProduct && (
                            <p className="text-[12px] font-semibold">{productNames.join(", ")}</p>
                          )}
                          {!hasProduct && (
                            <p className="text-[11px] text-slate-300">Topic only</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 px-2">
        <span className="flex items-center gap-1.5 text-[10px] text-ink-400">
          <svg width={14} height={14}><circle cx={7} cy={7} r={6} fill={PRODUCT_COLOR} opacity={0.85} /></svg>
          Product match
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-ink-400">
          <svg width={10} height={10}><circle cx={5} cy={5} r={4} fill={TOPIC_ONLY_COLOR} opacity={0.85} /></svg>
          Topic only
        </span>
      </div>
    </div>
  );
}
