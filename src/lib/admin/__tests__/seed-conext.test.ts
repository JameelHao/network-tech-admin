import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const conext = {
  name: "ACM CoNEXT 2026",
  abbreviation: "CoNEXT",
  url: "https://conferences.sigcomm.org/co-next/2026/",
  location: "Utrecht, The Netherlands",
  start_date: "2026-12-07",
  end_date: "2026-12-11",
  category: "network-systems",
  tier: "top",
  topics: ["transport-protocols", "edge-computing", "network-ai", "sdn-nfv"],
};

const sessions = [
  { title: "UniProxy: Breaking the Per-Flow Barrier in Multipath Proxy Design", authors: [], affiliations: [], topics: ["transport-protocols", "edge-computing"] },
  { title: "Energy Consumption in High-Speed Host Networking", authors: [], affiliations: [], topics: ["high-speed-networking", "dc-networking"] },
  { title: "Video Streaming Responsiveness", authors: [], affiliations: [], topics: ["transport-protocols", "network-monitoring"] },
  { title: "Joint IP–Optical Core Network Planning and Recovery", authors: [], affiliations: [], topics: ["high-speed-networking", "sdn-nfv"] },
  { title: "Decentralised Routing for Large-Scale LEO Satellite Constellations", authors: [], affiliations: [], topics: ["transport-protocols", "network-ai"] },
  { title: "Scalable Phishing Detection", authors: [], affiliations: [], topics: ["protocol-security", "network-monitoring"] },
  { title: "Defences Against Website Fingerprinting", authors: [], affiliations: [], topics: ["privacy-anonymity", "protocol-security"] },
  { title: "Cryptographic Acceleration on FPGA Platforms", authors: [], affiliations: [], topics: ["high-speed-networking", "protocol-security"] },
  { title: "State-Aware Synthetic Traffic Generation", authors: [], affiliations: [], topics: ["network-monitoring", "traffic-analysis"] },
];

describe("ACM CoNEXT 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(conext.category)).toBe(true);
    expect(VALID_TIERS.has(conext.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(conext.start_date < conext.end_date).toBe(true);
    expect(conext.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(conext.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has correct location and dates for Dec 2026", () => {
    expect(conext.location).toBe("Utrecht, The Netherlands");
    expect(conext.start_date).toBe("2026-12-07");
    expect(conext.end_date).toBe("2026-12-11");
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of conext.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });

  it("has 9 Round 1 sessions", () => {
    expect(sessions).toHaveLength(9);
  });

  it("has no duplicate session titles", () => {
    const titles = sessions.map((s) => s.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("has valid topics on every session", () => {
    for (const s of sessions) {
      expect(s.topics.length).toBeGreaterThan(0);
      for (const t of s.topics) {
        expect(VALID_SLUGS.has(t), `session "${s.title}" has unknown topic: ${t}`).toBe(true);
      }
    }
  });
});
