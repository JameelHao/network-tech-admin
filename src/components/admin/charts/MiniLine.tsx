"use client";

import {
  LineChart,
  Line,
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
};

export function MiniLine({
  data,
  color = "var(--color-navy-500)",
  height = 260,
}: Props) {
  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-ink-400)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--color-ink-400)" />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--color-line)" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
