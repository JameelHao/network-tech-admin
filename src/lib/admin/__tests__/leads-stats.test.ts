import { describe, it, expect } from "vitest";
import { computeLeadStats } from "../leads-utils";
import type { Lead } from "../types";

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "1",
    title: "Test Lead",
    stage: "new",
    source_type: "conference",
    source_id: "src-1",
    summary: null,
    notes: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...overrides,
  };
}

describe("computeLeadStats", () => {
  it("returns zeros for empty array", () => {
    const stats = computeLeadStats([]);
    expect(stats.total).toBe(0);
    expect(stats.newCount).toBe(0);
    expect(stats.trackingCount).toBe(0);
    expect(stats.evaluatingCount).toBe(0);
  });

  it("counts total items", () => {
    const leads = [
      makeLead({ id: "1" }),
      makeLead({ id: "2" }),
      makeLead({ id: "3" }),
    ];
    expect(computeLeadStats(leads).total).toBe(3);
  });

  it("counts new stage leads", () => {
    const leads = [
      makeLead({ id: "1", stage: "new" }),
      makeLead({ id: "2", stage: "new" }),
      makeLead({ id: "3", stage: "tracking" }),
    ];
    expect(computeLeadStats(leads).newCount).toBe(2);
  });

  it("counts tracking stage leads", () => {
    const leads = [
      makeLead({ id: "1", stage: "tracking" }),
      makeLead({ id: "2", stage: "tracking" }),
      makeLead({ id: "3", stage: "new" }),
    ];
    expect(computeLeadStats(leads).trackingCount).toBe(2);
  });

  it("counts evaluating stage leads", () => {
    const leads = [
      makeLead({ id: "1", stage: "evaluating" }),
      makeLead({ id: "2", stage: "new" }),
      makeLead({ id: "3", stage: "evaluating" }),
    ];
    expect(computeLeadStats(leads).evaluatingCount).toBe(2);
  });

  it("does not count archived in any stage stat", () => {
    const leads = [
      makeLead({ id: "1", stage: "archived" }),
      makeLead({ id: "2", stage: "archived" }),
    ];
    const stats = computeLeadStats(leads);
    expect(stats.total).toBe(2);
    expect(stats.newCount).toBe(0);
    expect(stats.trackingCount).toBe(0);
    expect(stats.evaluatingCount).toBe(0);
  });

  it("handles mixed stages correctly", () => {
    const leads = [
      makeLead({ id: "1", stage: "new" }),
      makeLead({ id: "2", stage: "tracking" }),
      makeLead({ id: "3", stage: "evaluating" }),
      makeLead({ id: "4", stage: "archived" }),
      makeLead({ id: "5", stage: "new" }),
    ];
    const stats = computeLeadStats(leads);
    expect(stats.total).toBe(5);
    expect(stats.newCount).toBe(2);
    expect(stats.trackingCount).toBe(1);
    expect(stats.evaluatingCount).toBe(1);
  });

  it("all items in single stage", () => {
    const leads = [
      makeLead({ id: "1", stage: "tracking" }),
      makeLead({ id: "2", stage: "tracking" }),
    ];
    const stats = computeLeadStats(leads);
    expect(stats.total).toBe(2);
    expect(stats.newCount).toBe(0);
    expect(stats.trackingCount).toBe(2);
    expect(stats.evaluatingCount).toBe(0);
  });
});
