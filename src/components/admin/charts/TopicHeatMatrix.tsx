"use client";

import type { TopicMatrixRow } from "@/lib/admin/ecosystem-stats";
import { TOPIC_CATEGORIES, type TopicCategory, getTopicLabel } from "@/lib/admin/topics";
import { HEATMAP_SCALE, getHeatColor } from "@/lib/admin/chart-theme";
import { useRouter } from "next/navigation";
import { Fragment, useCallback } from "react";

type Props = {
  data: TopicMatrixRow[];
  lang: "en" | "zh";
};

const DIMENSIONS = ["papers", "conferences", "products", "opensource", "vendors"] as const;
type Dim = (typeof DIMENSIONS)[number];

const DIM_LABELS: Record<Dim, { en: string; zh: string }> = {
  papers: { en: "Papers", zh: "论文" },
  conferences: { en: "Conf.", zh: "会议" },
  products: { en: "Products", zh: "产品" },
  opensource: { en: "OSS", zh: "开源" },
  vendors: { en: "Vendors", zh: "厂商" },
};

const DIM_ROUTES: Record<Dim, string> = {
  papers: "/admin/papers",
  conferences: "/admin/conferences",
  products: "/admin/products",
  opensource: "/admin/opensource",
  vendors: "/admin/vendors",
};

const CAT_ORDER: TopicCategory[] = ["network-systems", "measurement", "security", "emerging", "infrastructure"];

const CELL_H = 28;
const CELL_W = 56;

export function TopicHeatMatrix({ data, lang }: Props) {
  const router = useRouter();

  const handleClick = useCallback(
    (dim: Dim, slug: string) => router.push(`${DIM_ROUTES[dim]}?topic=${slug}`),
    [router],
  );

  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  const maxCount = Math.max(...data.flatMap((r) => DIMENSIONS.map((d) => r[d])), 1);

  const grouped = CAT_ORDER.map((cat) => ({
    category: cat,
    label: TOPIC_CATEGORIES[cat][lang],
    rows: data.filter((r) => r.category === cat),
  })).filter((g) => g.rows.length > 0);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Header */}
        <div className="flex border-b border-line pb-1.5 mb-1">
          <div className="w-[140px] shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-500 px-2">Topic</div>
          {DIMENSIONS.map((d) => (
            <div key={d} className="font-mono text-[10px] uppercase tracking-wider text-ink-500 text-center" style={{ width: CELL_W }}>
              {DIM_LABELS[d][lang]}
            </div>
          ))}
          <div className="w-12 font-mono text-[10px] uppercase tracking-wider text-ink-500 text-center">Total</div>
        </div>

        {/* Rows */}
        {grouped.map((g) => (
          <Fragment key={g.category}>
            <div className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-400 bg-paper/40 border-b border-line">
              {g.label}
            </div>
            {g.rows.map((row) => (
              <div key={row.slug} className="flex items-center hover:bg-paper/30 transition-colors border-b border-line/50">
                <div className="w-[140px] shrink-0 px-2 py-1 text-[12px] text-ink-700 truncate" title={getTopicLabel(row.slug, lang)}>
                  {getTopicLabel(row.slug, lang)}
                </div>
                {DIMENSIONS.map((d) => {
                  const count = row[d];
                  const ratio = count / maxCount;
                  return (
                    <div
                      key={d}
                      className="flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                      style={{ width: CELL_W, height: CELL_H }}
                      onClick={() => handleClick(d, row.slug)}
                      title={`${count} ${DIM_LABELS[d][lang]}`}
                    >
                      {count > 0 && (
                        <div
                          className="rounded-sm flex items-center justify-center"
                          style={{
                            width: 12 + ratio * 28,
                            height: 12 + ratio * 14,
                            backgroundColor: getHeatColor(ratio),
                          }}
                        >
                          <span className="text-[10px] tabular-nums text-white/90 font-medium">{count}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="w-12 text-center tabular-nums text-[12px] text-ink-600 font-medium">{row.total}</div>
              </div>
            ))}
          </Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3 px-2">
        <span className="font-mono text-[9px] text-ink-400 mr-0.5">Less</span>
        {HEATMAP_SCALE.map((color, i) => (
          <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: color }} />
        ))}
        <span className="font-mono text-[9px] text-ink-400 ml-0.5">More</span>
      </div>
    </div>
  );
}
