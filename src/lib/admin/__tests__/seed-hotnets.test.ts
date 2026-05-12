import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const hotnets = {
  name: "ACM HotNets 2026",
  abbreviation: "HotNets",
  url: "https://conferences.sigcomm.org/hotnets/2026/",
  location: "Salt Lake City, UT, USA",
  start_date: "2026-11-16",
  end_date: "2026-11-17",
  category: "emerging",
  tier: "workshop",
  topics: ["dc-networking", "programmable-net", "network-ai", "congestion-ctrl"],
};

describe("ACM HotNets 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(hotnets.category)).toBe(true);
    expect(VALID_TIERS.has(hotnets.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(hotnets.start_date < hotnets.end_date).toBe(true);
    expect(hotnets.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(hotnets.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has correct location and dates for Nov 2026", () => {
    expect(hotnets.location).toBe("Salt Lake City, UT, USA");
    expect(hotnets.start_date).toBe("2026-11-16");
    expect(hotnets.end_date).toBe("2026-11-17");
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of hotnets.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });
});
