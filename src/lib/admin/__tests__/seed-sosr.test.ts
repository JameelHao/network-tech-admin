import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const sosr = {
  name: "ACM SOSR 2026",
  abbreviation: "SOSR",
  url: "https://conferences.sigcomm.org/sosr/2026/",
  location: "TBD",
  start_date: "2026-03-03",
  end_date: "2026-03-04",
  category: "network-systems",
  tier: "good",
  topics: ["sdn-nfv", "programmable-net", "network-monitoring"],
};

describe("ACM SOSR 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(sosr.category)).toBe(true);
    expect(VALID_TIERS.has(sosr.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(sosr.start_date < sosr.end_date).toBe(true);
    expect(sosr.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sosr.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of sosr.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });

  it("has correct dates for Mar 2026", () => {
    expect(sosr.start_date).toBe("2026-03-03");
    expect(sosr.end_date).toBe("2026-03-04");
  });
});
