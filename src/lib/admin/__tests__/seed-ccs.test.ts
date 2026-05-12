import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const ccs = {
  name: "ACM CCS 2026",
  abbreviation: "CCS",
  url: "https://www.sigsac.org/ccs/CCS2026/",
  location: "The Hague, The Netherlands",
  start_date: "2026-11-15",
  end_date: "2026-11-19",
  category: "security",
  tier: "top",
  topics: ["protocol-security", "privacy-anonymity", "side-channels"],
};

describe("ACM CCS 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(ccs.category)).toBe(true);
    expect(VALID_TIERS.has(ccs.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(ccs.start_date < ccs.end_date).toBe(true);
    expect(ccs.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(ccs.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has confirmed location (not TBD)", () => {
    expect(ccs.location).not.toBe("TBD");
    expect(ccs.location).toBe("The Hague, The Netherlands");
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of ccs.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });

  it("has correct date for Nov 2026", () => {
    expect(ccs.start_date).toBe("2026-11-15");
    expect(ccs.end_date).toBe("2026-11-19");
  });
});
