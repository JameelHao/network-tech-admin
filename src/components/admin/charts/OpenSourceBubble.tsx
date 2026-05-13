"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { BubblePoint } from "@/lib/admin/ecosystem-stats";
import { TOPIC_CATEGORIES, type TopicCategory } from "@/lib/admin/topics";
import { useMemo } from "react";

type Props = {
  data: BubblePoint[];
  lang: "en" | "zh";
  height?: number;
};

const CATEGORY_COLORS: Record<TopicCategory | "other", string> = {
  "network-systems": "#4f46e5",
  "measurement": "#0284c7",
  "security": "#dc2626",
  "emerging": "#16a34a",
  "infrastructure": "#d97706",
  "other": "#6b7280",
};

const CAT_INDEX: Record<string, number> = {
  "network-systems": 1,
  "measurement": 2,
  "security": 3,
  "emerging": 4,
  "infrastructure": 5,
  "other": 6,
};

type ScatterPoint = { x: number; y: number; z: number; name: string; category: TopicCategory | "other"; lastActive: string; repoUrl: string };

function BubbleTooltip({ active, payload }: { active?: boolean; payload?: { payload?: ScatterPoint }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  if (!d) return null;
  return (
    <div className="rounded-xl bg-slate-900/[0.92] backdrop-blur-sm text-slate-100 px-3.5 py-2.5 shadow-xl border border-white/5">
      <p className="text-sm font-semibold">{d.name}</p>
      <p className="text-[11px] text-slate-300 mt-0.5">Stars: {d.z.toLocaleString()}</p>
      <p className="text-[11px] text-slate-400">Last active: {d.lastActive}</p>
    </div>
  );
}

export function OpenSourceBubble({ data, lang, height = 320 }: Props) {
  const points: ScatterPoint[] = useMemo(() => {
    const catGroups = new Map<string, number>();
    return data.map((d, i) => {
      const catKey = d.category;
      const idx = catGroups.get(catKey) ?? 0;
      catGroups.set(catKey, idx + 1);
      return {
        x: CAT_INDEX[catKey] ?? 6,
        y: (idx + 1) * 10 + (i % 3) * 3,
        z: d.stars,
        name: d.name,
        category: d.category,
        lastActive: d.lastActive,
        repoUrl: d.repoUrl,
      };
    });
  }, [data]);

  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  const maxStars = Math.max(...data.map((d) => d.stars), 1);

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 7]}
            tick={false}
            axisLine={false}
          />
          <YAxis type="number" dataKey="y" tick={false} axisLine={false} />
          <ZAxis type="number" dataKey="z" range={[40, 400]} domain={[0, maxStars]} />
          <Tooltip content={<BubbleTooltip />} />
          <Scatter data={points} animationDuration={800}>
            {points.map((p, i) => (
              <Cell
                key={i}
                fill={CATEGORY_COLORS[p.category]}
                fillOpacity={0.7}
                stroke={CATEGORY_COLORS[p.category]}
                strokeWidth={1}
                cursor="pointer"
                onClick={() => window.open(p.repoUrl, "_blank")}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-3 mt-2 px-2 flex-wrap">
        {(Object.keys(TOPIC_CATEGORIES) as TopicCategory[]).map((cat) => (
          <span key={cat} className="flex items-center gap-1.5 text-[10px] text-ink-400">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
            {TOPIC_CATEGORIES[cat][lang]}
          </span>
        ))}
      </div>
    </div>
  );
}
