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

  const colCount = DIMENSIONS.length;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[280px]">
        <div
          className="grid gap-px"
          style={{ gridTemplateColumns: `140px repeat(${colCount}, 1fr)` }}
        >
          <div />
          {DIMENSIONS.map((d) => (
            <div
              key={d}
              className="text-center font-mono text-[9px] text-ink-400 pb-1 truncate"
            >
              {DIM_LABELS[d][lang]}
            </div>
          ))}

          {grouped.map((g) => (
            <Fragment key={g.category}>
              <div
                className="font-mono text-[10px] uppercase tracking-wider text-ink-400 bg-paper/40 py-1 px-2"
                style={{ gridColumn: "1 / -1" }}
              >
                {g.label}
              </div>
              {g.rows.map((row) => (
                <div key={row.slug} className="contents">
                  <div
                    className="text-right pr-2 font-mono text-[10px] text-ink-500 truncate leading-7"
                    title={getTopicLabel(row.slug, lang)}
                  >
                    {getTopicLabel(row.slug, lang)}
                  </div>
                  {DIMENSIONS.map((d) => {
                    const count = row[d];
                    const ratio = count / maxCount;
                    return (
                      <div
                        key={d}
                        className="h-7 rounded-sm transition-all duration-150 hover:scale-110 hover:shadow-md hover:z-10 relative group cursor-pointer"
                        style={{ backgroundColor: count > 0 ? getHeatColor(ratio) : undefined }}
                        onClick={() => handleClick(d, row.slug)}
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
            </Fragment>
          ))}
        </div>

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
