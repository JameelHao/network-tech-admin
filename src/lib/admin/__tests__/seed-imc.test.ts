import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const imc = {
  name: "ACM IMC 2026",
  abbreviation: "IMC",
  url: "https://conferences.sigcomm.org/imc/2026/",
  location: "Karlsruhe, Germany",
  start_date: "2026-11-03",
  end_date: "2026-11-06",
  category: "measurement",
  tier: "top",
  topics: ["internet-measure", "traffic-analysis", "dns-bgp"],
};

describe("ACM IMC 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(imc.category)).toBe(true);
    expect(VALID_TIERS.has(imc.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(imc.start_date < imc.end_date).toBe(true);
    expect(imc.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(imc.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has confirmed location (not TBD)", () => {
    expect(imc.location).not.toBe("TBD");
    expect(imc.location).toBe("Karlsruhe, Germany");
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of imc.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });

  it("has correct date for Nov 2026", () => {
    expect(imc.start_date).toBe("2026-11-03");
    expect(imc.end_date).toBe("2026-11-06");
  });
});
