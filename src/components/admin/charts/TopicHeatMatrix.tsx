"use client";

import type { TopicMatrixRow } from "@/lib/admin/ecosystem-stats";
import { TOPIC_CATEGORIES, type TopicCategory } from "@/lib/admin/topics";
import { useRouter } from "next/navigation";
import { Fragment } from "react";

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

function getCellColor(count: number, max: number): string {
  if (count === 0) return "bg-surface";
  const ratio = count / max;
  if (ratio <= 0.2) return "bg-indigo-100 dark:bg-indigo-900/30";
  if (ratio <= 0.4) return "bg-indigo-200 dark:bg-indigo-800/40";
  if (ratio <= 0.6) return "bg-indigo-300 dark:bg-indigo-700/50";
  if (ratio <= 0.8) return "bg-indigo-400 dark:bg-indigo-600/60 text-white";
  return "bg-indigo-500 dark:bg-indigo-500/70 text-white";
}

const CAT_ORDER: TopicCategory[] = ["network-systems", "measurement", "security", "emerging", "infrastructure"];

export function TopicHeatMatrix({ data, lang }: Props) {
  const router = useRouter();

  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  const maxCount = Math.max(...data.flatMap((r) => DIMENSIONS.map((d) => r[d])), 1);

  const grouped = CAT_ORDER.map((cat) => ({
    category: cat,
    label: TOPIC_CATEGORIES[cat][lang],
    rows: data.filter((r) => r.category === cat),
  })).filter((g) => g.rows.length > 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px] border-collapse min-w-[500px]">
        <thead>
          <tr className="border-b border-line">
            <th className="px-2 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-ink-500 sticky left-0 bg-surface z-10 min-w-[120px]">Topic</th>
            {DIMENSIONS.map((d) => (
              <th key={d} className="px-2 py-2 text-center font-mono text-[10px] uppercase tracking-wider text-ink-500 w-16">{DIM_LABELS[d][lang]}</th>
            ))}
            <th className="px-2 py-2 text-center font-mono text-[10px] uppercase tracking-wider text-ink-500 w-14">Total</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map((g) => (
            <Fragment key={g.category}>
              <tr>
                <td colSpan={DIMENSIONS.length + 2} className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-400 bg-paper/40 border-b border-line">
                  {g.label}
                </td>
              </tr>
              {g.rows.map((row) => (
                <tr key={row.slug} className="border-b border-line/50 hover:bg-paper/30 transition-colors">
                  <td className="px-2 py-1.5 text-ink-700 truncate sticky left-0 bg-surface z-10" title={row.slug}>{row.slug}</td>
                  {DIMENSIONS.map((d) => (
                    <td
                      key={d}
                      className={`px-1 py-1 text-center cursor-pointer transition-all hover:scale-105 ${getCellColor(row[d], maxCount)}`}
                      onClick={() => router.push(`${DIM_ROUTES[d]}?topic=${row.slug}`)}
                      title={`${row[d]} ${DIM_LABELS[d][lang]}`}
                    >
                      <span className="tabular-nums text-[11px]">{row[d] || ""}</span>
                    </td>
                  ))}
                  <td className="px-1 py-1.5 text-center tabular-nums text-ink-600 font-medium">{row.total}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-end gap-1.5 mt-3 px-2">
        <span className="font-mono text-[9px] text-ink-400">Less</span>
        {["bg-indigo-100 dark:bg-indigo-900/30", "bg-indigo-200 dark:bg-indigo-800/40", "bg-indigo-300 dark:bg-indigo-700/50", "bg-indigo-400 dark:bg-indigo-600/60", "bg-indigo-500 dark:bg-indigo-500/70"].map((cls, i) => (
          <div key={i} className={`w-4 h-4 rounded-sm ${cls}`} />
        ))}
        <span className="font-mono text-[9px] text-ink-400">More</span>
      </div>
    </div>
  );
}
