import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const icml = {
  name: "ICML 2026",
  abbreviation: "ICML",
  url: "https://icml.cc/Conferences/2026",
  location: "Seoul, South Korea",
  start_date: "2026-07-06",
  end_date: "2026-07-11",
  category: "emerging",
  tier: "top",
  topics: ["machine-learning", "network-ai", "optimization"],
};

describe("ICML 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(icml.category)).toBe(true);
    expect(VALID_TIERS.has(icml.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(icml.start_date < icml.end_date).toBe(true);
    expect(icml.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(icml.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has correct location and dates for Jul 2026", () => {
    expect(icml.location).toBe("Seoul, South Korea");
    expect(icml.start_date).toBe("2026-07-06");
    expect(icml.end_date).toBe("2026-07-11");
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of icml.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });
});
