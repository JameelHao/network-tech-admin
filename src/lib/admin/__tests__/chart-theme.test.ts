import { describe, it, expect } from "vitest";
import { CHART_COLORS, PIE_COLORS, STAGE_GRADIENTS } from "../chart-theme";

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
