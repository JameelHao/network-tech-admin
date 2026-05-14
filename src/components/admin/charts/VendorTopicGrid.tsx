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
      <div className="min-w-[320px]">
        <div
          className="grid gap-px"
          style={{ gridTemplateColumns: `120px repeat(${allTopics.length}, 1fr)` }}
        >
          <div />
          {allTopics.map((t) => (
            <div
              key={t}
              className="text-center font-mono text-[9px] text-ink-400 pb-1 truncate"
              title={getTopicLabel(t, lang)}
            >
              {getTopicLabel(t, lang).slice(0, 6)}
            </div>
          ))}

          {data.map((v) => (
            <div key={v.vendorId} className="contents">
              <div className="text-right pr-2 font-mono text-[10px] text-ink-500 truncate leading-7">
                <Link href={`/admin/vendors/${v.vendorId}`} className="hover:text-navy-600 transition-colors">
                  {v.vendorName}
                </Link>
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
                    className="h-7 rounded-sm transition-all duration-150 hover:scale-110 hover:shadow-md hover:z-10 relative group cursor-default"
                    style={{
                      backgroundColor: has
                        ? hasProduct ? PRODUCT_COLOR : TOPIC_ONLY_COLOR
                        : undefined,
                    }}
                    onMouseEnter={() => has ? setHoveredCell(cellKey) : undefined}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {has && isHovered && (
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
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-3 px-2">
          <span className="flex items-center gap-1.5 text-[10px] text-ink-400">
            <span className="inline-block w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: PRODUCT_COLOR }} />
            Product match
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-ink-400">
            <span className="inline-block w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: TOPIC_ONLY_COLOR }} />
            Topic only
          </span>
        </div>
      </div>
    </div>
  );
}
