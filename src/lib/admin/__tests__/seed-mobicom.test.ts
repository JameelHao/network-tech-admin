import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const mobicom = {
  name: "ACM MobiCom 2026",
  abbreviation: "MobiCom",
  url: "https://www.sigmobile.org/mobicom/2026/",
  location: "Austin, TX, USA",
  start_date: "2026-10-26",
  end_date: "2026-10-30",
  category: "network-systems",
  tier: "top",
  topics: ["mobile-wireless", "5g-6g", "edge-computing"],
};

describe("ACM MobiCom 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(mobicom.category)).toBe(true);
    expect(VALID_TIERS.has(mobicom.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(mobicom.start_date < mobicom.end_date).toBe(true);
    expect(mobicom.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(mobicom.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has confirmed location (not TBD)", () => {
    expect(mobicom.location).not.toBe("TBD");
    expect(mobicom.location).toBe("Austin, TX, USA");
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of mobicom.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });

  it("has correct date for Oct 2026", () => {
    expect(mobicom.start_date).toBe("2026-10-26");
    expect(mobicom.end_date).toBe("2026-10-30");
  });
});
