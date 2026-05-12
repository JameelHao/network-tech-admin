import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const atc = {
  name: "ACM SIGOPS ATC 2026",
  abbreviation: "ATC",
  url: "https://sigops.org/s/conferences/atc/2026/",
  location: "Hong Kong",
  start_date: "2026-11-15",
  end_date: "2026-11-18",
  category: "infrastructure",
  tier: "top",
  topics: ["distributed-sys", "cloud-infra", "os-network-stack", "ebpf-xdp"],
};

describe("ACM SIGOPS ATC 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(atc.category)).toBe(true);
    expect(VALID_TIERS.has(atc.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(atc.start_date < atc.end_date).toBe(true);
    expect(atc.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(atc.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("reflects ACM SIGOPS rebrand (not USENIX)", () => {
    expect(atc.name).toContain("ACM SIGOPS");
    expect(atc.url).toContain("sigops.org");
  });

  it("has confirmed location (not TBD)", () => {
    expect(atc.location).not.toBe("TBD");
    expect(atc.location).toBe("Hong Kong");
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of atc.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });

  it("has correct date for Nov 2026", () => {
    expect(atc.start_date).toBe("2026-11-15");
    expect(atc.end_date).toBe("2026-11-18");
  });
});
