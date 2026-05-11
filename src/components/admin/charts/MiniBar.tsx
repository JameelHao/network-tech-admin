"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ChartPoint } from "@/lib/admin/insights";

type Props = {
  data: ChartPoint[];
  color?: string;
  height?: number;
  layout?: "horizontal" | "vertical";
};

export function MiniBar({
  data,
  color = "var(--color-navy-500)",
  height = 260,
  layout = "vertical",
}: Props) {
  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  if (layout === "vertical") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-line)" />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-ink-400)" />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fontSize: 11 }}
            stroke="var(--color-ink-400)"
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--color-line)" }}
          />
          <Bar dataKey="value" fill={color} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-line)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-ink-400)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--color-ink-400)" />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--color-line)" }}
        />
        <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
