"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ChartPoint } from "@/lib/admin/insights";
import { PIE_COLORS } from "@/lib/admin/chart-theme";
import { ChartTooltip } from "./ChartTooltip";

type Props = {
  data: ChartPoint[];
  height?: number;
  innerRadius?: number;
  total?: number;
  className?: string;
};

export function MiniPie({ data, height = 260, innerRadius = 60, total, className }: Props) {
  if (!data.length) return <p className="text-ink-400 text-sm">No data</p>;

  const centerValue = total ?? data.reduce((s, d) => s + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          innerRadius={innerRadius}
          outerRadius={90}
          paddingAngle={3}
          cornerRadius={4}
          strokeWidth={0}
          animationBegin={0}
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <text
          x="50%"
          y="42%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-ink-800 dark:fill-ink-200"
          style={{ fontSize: 22, fontWeight: 600 }}
        >
          {centerValue.toLocaleString()}
        </text>
        <text
          x="50%"
          y="52%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-ink-400"
          style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
        >
          Total
        </text>
        <Tooltip content={(props) => <ChartTooltip {...props} />} />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          iconType="circle"
          iconSize={6}
          wrapperStyle={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            paddingTop: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
