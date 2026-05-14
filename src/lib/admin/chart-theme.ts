export const CHART_COLORS = {
  primary: { start: "#6366f1", end: "#818cf8" },
  secondary: { start: "#0ea5e9", end: "#38bdf8" },
  success: { start: "#10b981", end: "#34d399" },
  warning: { start: "#f59e0b", end: "#fbbf24" },
  danger: { start: "#ef4444", end: "#f87171" },
  purple: { start: "#8b5cf6", end: "#a78bfa" },
  cyan: { start: "#06b6d4", end: "#22d3ee" },
  pink: { start: "#ec4899", end: "#f472b6" },
};

export const PIE_COLORS = [
  CHART_COLORS.primary.start,
  CHART_COLORS.secondary.start,
  CHART_COLORS.success.start,
  CHART_COLORS.warning.start,
  CHART_COLORS.danger.start,
  CHART_COLORS.purple.start,
  CHART_COLORS.cyan.start,
  CHART_COLORS.pink.start,
];

export const HEATMAP_SCALE = [
  "#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1",
  "#4f46e5", "#4338ca", "#3730a3", "#312e81", "#1e1b4b",
];

export function getHeatColor(ratio: number): string {
  if (ratio <= 0) return HEATMAP_SCALE[0];
  const idx = Math.min(Math.floor(ratio * HEATMAP_SCALE.length), HEATMAP_SCALE.length - 1);
  return HEATMAP_SCALE[idx];
}

export const STAGE_GRADIENTS: Record<string, { start: string; end: string }> = {
  new: { start: "#3b82f6", end: "#60a5fa" },
  tracking: { start: "#f59e0b", end: "#fbbf24" },
  evaluating: { start: "#10b981", end: "#34d399" },
  archived: { start: "#94a3b8", end: "#cbd5e1" },
};
