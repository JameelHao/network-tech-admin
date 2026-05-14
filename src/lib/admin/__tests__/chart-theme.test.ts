import { describe, it, expect } from "vitest";
import { CHART_COLORS, PIE_COLORS, STAGE_GRADIENTS, HEATMAP_SCALE, getHeatColor } from "../chart-theme";

describe("chart-theme", () => {
  it("exports 8 gradient color pairs", () => {
    const keys = Object.keys(CHART_COLORS);
    expect(keys.length).toBe(8);
    for (const key of keys) {
      const c = CHART_COLORS[key as keyof typeof CHART_COLORS];
      expect(c.start).toMatch(/^#[0-9a-f]{6}$/);
      expect(c.end).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("PIE_COLORS has 8 entries matching CHART_COLORS start values", () => {
    expect(PIE_COLORS.length).toBe(8);
    const starts = Object.values(CHART_COLORS).map((c) => c.start);
    for (const color of PIE_COLORS) {
      expect(starts).toContain(color);
    }
  });

  it("HEATMAP_SCALE has 10 valid hex colors", () => {
    expect(HEATMAP_SCALE.length).toBe(10);
    for (const color of HEATMAP_SCALE) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("getHeatColor returns first color for 0 ratio", () => {
    expect(getHeatColor(0)).toBe(HEATMAP_SCALE[0]);
  });

  it("getHeatColor returns last color for ratio 1", () => {
    expect(getHeatColor(1)).toBe(HEATMAP_SCALE[HEATMAP_SCALE.length - 1]);
  });

  it("getHeatColor returns middle colors for mid ratios", () => {
    const mid = getHeatColor(0.5);
    expect(HEATMAP_SCALE).toContain(mid);
    expect(mid).toBe(HEATMAP_SCALE[5]);
  });

  it("getHeatColor clamps negative ratio to first color", () => {
    expect(getHeatColor(-0.5)).toBe(HEATMAP_SCALE[0]);
  });

  it("getHeatColor clamps ratio > 1 to last color", () => {
    expect(getHeatColor(1.5)).toBe(HEATMAP_SCALE[HEATMAP_SCALE.length - 1]);
  });

  it("STAGE_GRADIENTS covers funnel stages", () => {
    expect(STAGE_GRADIENTS).toHaveProperty("new");
    expect(STAGE_GRADIENTS).toHaveProperty("tracking");
    expect(STAGE_GRADIENTS).toHaveProperty("evaluating");
    expect(STAGE_GRADIENTS).toHaveProperty("archived");
    for (const grad of Object.values(STAGE_GRADIENTS)) {
      expect(grad.start).toMatch(/^#[0-9a-f]{6}$/);
      expect(grad.end).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

});
