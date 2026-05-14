import { describe, it, expect } from "vitest";
import { computeTalentStats } from "../talents-utils";
import type { TalentLead } from "../types";

function makeTalent(overrides: Partial<TalentLead> = {}): TalentLead {
  return {
    id: "1",
    name: "Test Person",
    role: null,
    company: null,
    linkedin_url: null,
    source: null,
    topics: [],
    stage: "new",
    notes: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...overrides,
  };
}

describe("computeTalentStats", () => {
  it("returns zeros for empty array", () => {
    const stats = computeTalentStats([]);
    expect(stats.total).toBe(0);
    expect(stats.newCount).toBe(0);
    expect(stats.trackingCount).toBe(0);
    expect(stats.companyCount).toBe(0);
  });

  it("counts total items", () => {
    const talents = [
      makeTalent({ id: "1" }),
      makeTalent({ id: "2" }),
      makeTalent({ id: "3" }),
    ];
    expect(computeTalentStats(talents).total).toBe(3);
  });

  it("counts new stage talents", () => {
    const talents = [
      makeTalent({ id: "1", stage: "new" }),
      makeTalent({ id: "2", stage: "new" }),
      makeTalent({ id: "3", stage: "tracking" }),
    ];
    expect(computeTalentStats(talents).newCount).toBe(2);
  });

  it("counts tracking stage talents", () => {
    const talents = [
      makeTalent({ id: "1", stage: "tracking" }),
      makeTalent({ id: "2", stage: "tracking" }),
      makeTalent({ id: "3", stage: "new" }),
    ];
    expect(computeTalentStats(talents).trackingCount).toBe(2);
  });

  it("counts distinct companies", () => {
    const talents = [
      makeTalent({ id: "1", company: "Google" }),
      makeTalent({ id: "2", company: "Cisco" }),
      makeTalent({ id: "3", company: "Google" }),
      makeTalent({ id: "4", company: null }),
    ];
    expect(computeTalentStats(talents).companyCount).toBe(2);
  });

  it("does not count archived/evaluating in new or tracking", () => {
    const talents = [
      makeTalent({ id: "1", stage: "archived" }),
      makeTalent({ id: "2", stage: "evaluating" }),
    ];
    const stats = computeTalentStats(talents);
    expect(stats.total).toBe(2);
    expect(stats.newCount).toBe(0);
    expect(stats.trackingCount).toBe(0);
  });

  it("handles mixed stages and companies", () => {
    const talents = [
      makeTalent({ id: "1", stage: "new", company: "Google" }),
      makeTalent({ id: "2", stage: "tracking", company: "Cisco" }),
      makeTalent({ id: "3", stage: "evaluating", company: "Google" }),
      makeTalent({ id: "4", stage: "archived", company: null }),
      makeTalent({ id: "5", stage: "new", company: "Meta" }),
    ];
    const stats = computeTalentStats(talents);
    expect(stats.total).toBe(5);
    expect(stats.newCount).toBe(2);
    expect(stats.trackingCount).toBe(1);
    expect(stats.companyCount).toBe(3);
  });

  it("all null companies yields zero companyCount", () => {
    const talents = [
      makeTalent({ id: "1", company: null }),
      makeTalent({ id: "2", company: null }),
    ];
    expect(computeTalentStats(talents).companyCount).toBe(0);
  });
});
