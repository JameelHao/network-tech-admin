"use client";

import { useId } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ChartPoint } from "@/lib/admin/insights";
import { CHART_COLORS } from "@/lib/admin/chart-theme";
import { ChartTooltip } from "./ChartTooltip";

type Props = {
  data: ChartPoint[];
  color?: string;
  height?: number;
};

export function MiniLine({
  data,
  color = CHART_COLORS.primary.start,
  height = 260,
}: Props) {
  const id = useId();
  const gradId = `lineGrad-${id}`;

  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" strokeOpacity={0.5} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-ink-400)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--color-ink-400)" />
        <Tooltip
          content={(props) => <ChartTooltip {...props} />}
          cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradId})`}
          dot={false}
          activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
