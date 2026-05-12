"use client";

import { useId } from "react";
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
import { CHART_COLORS } from "@/lib/admin/chart-theme";
import { ChartTooltip } from "./ChartTooltip";

type Props = {
  data: ChartPoint[];
  color?: string;
  height?: number;
  layout?: "horizontal" | "vertical";
};

export function MiniBar({
  data,
  color = CHART_COLORS.primary.start,
  height = 260,
  layout = "vertical",
}: Props) {
  const id = useId();
  const gradId = `barGrad-${id}`;

  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  const gradEnd = CHART_COLORS.primary.end;

  if (layout === "vertical") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={gradEnd} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-line)" />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-ink-400)" />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fontSize: 11 }}
            stroke="var(--color-ink-400)"
          />
          <Tooltip content={(props) => <ChartTooltip {...props} />} />
          <Bar
            dataKey="value"
            fill={`url(#${gradId})`}
            radius={[0, 6, 6, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={gradEnd} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-line)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-ink-400)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--color-ink-400)" />
        <Tooltip content={(props) => <ChartTooltip {...props} />} />
        <Bar
          dataKey="value"
          fill={`url(#${gradId})`}
          radius={[6, 6, 0, 0]}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
