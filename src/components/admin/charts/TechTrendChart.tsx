"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { TrendPoint } from "@/lib/admin/ecosystem-stats";
import { TOPIC_CATEGORIES, getTopicCategory, getTopicLabel, type TopicCategory } from "@/lib/admin/topics";
import { PIE_COLORS } from "@/lib/admin/chart-theme";
import { ChartTooltip } from "./ChartTooltip";

type Props = {
  data: TrendPoint[];
  topicKeys: string[];
  lang: "en" | "zh";
  height?: number;
};

const CAT_OPTIONS: TopicCategory[] = ["network-systems", "measurement", "security", "emerging", "infrastructure"];

export function TechTrendChart({ data, topicKeys, lang, height = 300 }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<TopicCategory | "all">("all");

  const filteredKeys = useMemo(() => {
    if (categoryFilter === "all") return topicKeys;
    return topicKeys.filter((k) => getTopicCategory(k) === categoryFilter);
  }, [topicKeys, categoryFilter]);

  const labelMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const k of topicKeys) m[k] = getTopicLabel(k, lang);
    return m;
  }, [topicKeys, lang]);

  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${categoryFilter === "all" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" : "text-ink-500 hover:bg-paper"}`}
        >
          All
        </button>
        {CAT_OPTIONS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${categoryFilter === cat ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" : "text-ink-500 hover:bg-paper"}`}
          >
            {TOPIC_CATEGORIES[cat][lang]}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" strokeOpacity={0.5} />
          <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="var(--color-ink-400)" />
          <YAxis tick={{ fontSize: 11 }} stroke="var(--color-ink-400)" />
          <Tooltip content={(props) => <ChartTooltip {...props} labelMap={labelMap} />} />
          <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => labelMap[value] || value} />
          {filteredKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={PIE_COLORS[i % PIE_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
              animationDuration={800}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
