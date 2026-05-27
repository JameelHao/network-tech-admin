"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { HEATMAP_SCALE, getHeatColor } from "@/lib/admin/chart-theme";
import type { Lang } from "@/lib/i18n/dict";

const METRICS = ["papers", "news", "repos", "products"] as const;
type Metric = (typeof METRICS)[number];
type SortKey = Metric | "name";

type CompanyRow = {
  slug: string;
  name: string;
  paperCount: number;
  newsCount: number;
  repoCount: number;
  productCount: number;
};

type Props = {
  data: CompanyRow[];
  lang: Lang;
  labels: Record<string, string>;
};

const METRIC_FIELD: Record<Metric, keyof CompanyRow> = {
  papers: "paperCount",
  news: "newsCount",
  repos: "repoCount",
  products: "productCount",
};

function Tooltip({ company, metric, count, x, y }: { company: string; metric: string; count: number; x: number; y: number }) {
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: x + 12, top: y - 10 }}
    >
      <div className="bg-ink-800 text-white text-[11px] font-mono px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap">
        {company} · {metric}: <strong>{count}</strong>
      </div>
    </div>
  );
}

export function CompanyHeatmap({ data, labels }: Props) {
  const maxCount = useMemo(
    () => Math.max(1, ...data.flatMap((c) => [c.paperCount, c.newsCount, c.repoCount, c.productCount])),
    [data],
  );

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [tooltip, setTooltip] = useState<{ company: string; metric: string; count: number; x: number; y: number } | null>(null);

  const sorted = useMemo(() => {
    const top = data.slice(0, 20);
    if (sortKey === "name") {
      return [...top].sort((a, b) => a.name.localeCompare(b.name));
    }
    const field = METRIC_FIELD[sortKey as Metric] ?? "paperCount";
    return [...top].sort((a, b) => {
      const diff = Number(b[field]) - Number(a[field]);
      return sortDir === "desc" ? diff : -diff;
    });
  }, [data, sortKey, sortDir]);

  const handleHeaderClick = useCallback(
    (m: SortKey) => {
      if (sortKey === m) {
        setSortDir((d) => (d === "desc" ? "asc" : "desc"));
      } else {
        setSortKey(m);
        setSortDir("desc");
      }
    },
    [sortKey],
  );

  const showTooltip = useCallback((e: React.MouseEvent, company: string, metric: string, count: number) => {
    setTooltip({ company, metric, count, x: e.clientX, y: e.clientY });
  }, []);

  if (data.length === 0) return null;

  return (
    <section className="rounded-lg border border-line bg-surface overflow-hidden">
      <header className="px-5 py-3 border-b border-line bg-paper/30">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{labels.title}</p>
      </header>

      <div className="overflow-x-auto">
        <div className="min-w-[480px] p-4 sm:p-5">
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: `130px repeat(${METRICS.length}, 1fr)` }}>
            {/* Header row */}
            <div />
            {METRICS.map((m) => {
              const active = sortKey === m;
              return (
                <button
                  key={m}
                  onClick={() => handleHeaderClick(m)}
                  className="text-center font-mono text-[9px] uppercase tracking-wider text-ink-400 pb-2 truncate hover:text-ink-700 transition-colors cursor-pointer"
                >
                  {labels[m]}
                  {active && <span className="ml-1 text-[8px]">{sortDir === "desc" ? "▼" : "▲"}</span>}
                </button>
              );
            })}

            {/* Data rows */}
            {sorted.map((c, ri) => {
              const counts: [Metric, number][] = METRICS.map((m) => [m, c[METRIC_FIELD[m]] as number]);
              return (
                <div key={c.slug} className="contents">
                  <div className="flex items-center pr-2">
                    <Link
                      href={`/admin/companies/${c.slug}`}
                      className="font-mono text-[10px] text-ink-500 truncate hover:text-navy-600 transition-colors leading-7"
                    >
                      {c.name}
                    </Link>
                  </div>
                  {counts.map(([m, count]) => {
                    const ratio = count / maxCount;
                    const bg = count > 0 ? getHeatColor(ratio) : "transparent";
                    const border = count > 0 ? "" : "border border-dashed border-ink-200";
                    const textColor = ratio > 0.5 ? "text-white/90" : "text-ink-600";

                    return (
                      <div
                        key={m}
                        className={`h-[28px] rounded-[4px] flex items-center justify-center relative group cursor-default transition-all duration-150 hover:scale-[1.15] hover:shadow-lg hover:z-10 ${border}`}
                        style={{ backgroundColor: bg }}
                        onMouseEnter={(e) => showTooltip(e, c.name, labels[m], count)}
                        onMouseMove={(e) => setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <span className={`text-[10px] font-mono tabular-nums font-medium ${textColor} transition-opacity`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 mt-4 px-1">
            <span className="font-mono text-[9px] text-ink-400">Less</span>
            <div className="flex gap-px">
              {HEATMAP_SCALE.map((color, i) => {
                const val = Math.round((i / (HEATMAP_SCALE.length - 1)) * maxCount);
                return (
                  <div
                    key={i}
                    className="w-4 h-3 rounded-[2px]"
                    style={{ backgroundColor: color }}
                    title={`~${val}`}
                  />
                );
              })}
            </div>
            <span className="font-mono text-[9px] text-ink-400">More</span>
          </div>
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && <Tooltip {...tooltip} />}
    </section>
  );
}
