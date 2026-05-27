"use client";

import { useId, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PIE_COLORS } from "@/lib/admin/chart-theme";
import { ChartTooltip } from "./charts/ChartTooltip";
import type { Lang } from "@/lib/i18n/dict";

type Props = {
  data: Record<string, string | number>[];
  topics: string[];
  lang: Lang;
};

const TOPIC_LABELS: Record<string, string> = {
  "dc-networking": "DC Networking",
  "transport-protocols": "Transport Protocols",
  "programmable-net": "Programmable Nets",
  "sdn-nfv": "SDN/NFV",
  "congestion-ctrl": "Congestion Control",
  "internet-measure": "Internet Measurement",
  "traffic-analysis": "Traffic Analysis",
  "dns-bgp": "DNS/BGP",
  "network-monitoring": "Net Monitoring",
  "network-observability": "Net Observability",
  "ddos-defense": "DDoS Defense",
  "protocol-security": "Protocol Security",
  "privacy-anonymity": "Privacy & Anonymity",
  "side-channels": "Side Channels",
  "zero-trust": "Zero Trust",
  "sase-sse": "SASE/SSE",
  "edge-computing": "Edge Computing",
  "network-ai": "Net AI/ML",
  "machine-learning": "Machine Learning",
  optimization: "Optimization",
  "ai-networking": "AI for Nets",
  "network-digital-twin": "Net Digital Twin",
  "intent-based-networking": "Intent-Based Nets",
  "satellite-leo": "Satellite/LEO",
  "quantum-networking": "Quantum Nets",
  "5g-6g": "5G/6G",
  "mobile-wireless": "Mobile & Wireless",
  "ebpf-xdp": "eBPF/XDP",
  "distributed-sys": "Distributed Sys",
  "storage-net": "Storage Nets",
  "os-network-stack": "OS Net Stack",
  "cloud-infra": "Cloud Infra",
  hpc: "HPC",
  "high-speed-networking": "High-Speed Nets",
  "parallel-computing": "Parallel Computing",
  security: "Security",
  automation: "Automation",
  observability: "Observability",
};

export function CompanyTrendChart({ data, topics, lang }: Props) {
  const uid = useId();

  const totals = useMemo(() => {
    const t = new Map<string, number>();
    for (const point of data) {
      for (const slug of topics) {
        const v = Number(point[slug]) || 0;
        t.set(slug, (t.get(slug) ?? 0) + v);
      }
    }
    return t;
  }, [data, topics]);

  if (data.length === 0 || topics.length === 0) return null;

  const label = (slug: string) =>
    TOPIC_LABELS[slug] ?? slug;

  return (
    <div>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <defs>
          {topics.map((slug, i) => {
            const color = PIE_COLORS[i % PIE_COLORS.length];
            return (
              <linearGradient key={slug} id={`${uid}-${slug}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" strokeOpacity={0.4} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: "var(--color-ink-400)" }}
          axisLine={{ stroke: "var(--color-line)", strokeOpacity: 0.5 }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--color-ink-400)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={24}
        />
        <Tooltip
          content={(props) => <ChartTooltip {...props} />}
          cursor={{ stroke: "var(--color-ink-300)", strokeWidth: 1, strokeDasharray: "3 3" }}
        />
        {topics.map((slug, i) => {
          const color = PIE_COLORS[i % PIE_COLORS.length];
          return (
            <Area
              key={slug}
              type="monotone"
              dataKey={slug}
              name={label(slug)}
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#${uid}-${slug})`}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: "#fff", strokeWidth: 2 }}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 px-1">
      {topics.map((slug, i) => {
        const color = PIE_COLORS[i % PIE_COLORS.length];
        return (
          <span key={slug} className="inline-flex items-center gap-1.5 font-mono text-[10px] text-ink-600">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            {label(slug)}
            <span className="text-ink-400">({totals.get(slug) ?? 0})</span>
          </span>
        );
      })}
    </div>
    </div>
  );
}
