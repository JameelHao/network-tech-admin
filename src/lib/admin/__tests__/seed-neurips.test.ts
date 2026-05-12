import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const neurips = {
  name: "NeurIPS 2026",
  abbreviation: "NeurIPS",
  url: "https://neurips.cc/Conferences/2026",
  location: "Sydney, Australia",
  start_date: "2026-12-06",
  end_date: "2026-12-12",
  category: "emerging",
  tier: "top",
  topics: ["network-ai", "machine-learning", "optimization"],
};

describe("NeurIPS 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(neurips.category)).toBe(true);
    expect(VALID_TIERS.has(neurips.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(neurips.start_date < neurips.end_date).toBe(true);
    expect(neurips.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(neurips.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has correct location and dates for Dec 2026", () => {
    expect(neurips.location).toBe("Sydney, Australia");
    expect(neurips.start_date).toBe("2026-12-06");
    expect(neurips.end_date).toBe("2026-12-12");
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of neurips.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });
});
