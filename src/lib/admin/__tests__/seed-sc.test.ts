import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const sc = {
  name: "SC 2026 (Supercomputing)",
  abbreviation: "SC",
  url: "https://sc26.supercomputing.org/",
  location: "Chicago, IL, USA",
  start_date: "2026-11-15",
  end_date: "2026-11-20",
  category: "infrastructure",
  tier: "top",
  topics: ["hpc", "high-speed-networking", "parallel-computing"],
};

const sessions = [
  { title: "INDIS: Innovating the Network for Data-Intensive Science", authors: [], affiliations: [], topics: ["high-speed-networking", "hpc", "network-monitoring"] },
  { title: "High Performance Fabrics for AI and HPC", authors: [], affiliations: [], topics: ["high-speed-networking", "hpc", "dc-networking"] },
  { title: "ECHO: Edge-Cloud-HPC Operational Continuum", authors: [], affiliations: [], topics: ["hpc", "edge-computing", "cloud-infra"] },
  { title: "RESDIS: Resource Disaggregation", authors: [], affiliations: [], topics: ["hpc", "dc-networking", "high-speed-networking"] },
  { title: "Cyber Security in HPC", authors: [], affiliations: [], topics: ["hpc", "protocol-security"] },
  { title: "Trillion Parameter Workshop", authors: [], affiliations: [], topics: ["hpc", "machine-learning", "distributed-sys"] },
  { title: "EESP 2026: Energy Efficiency in Supercomputing and Networking", authors: [], affiliations: [], topics: ["hpc", "high-speed-networking"] },
  { title: "Sovereign AI Supercomputing Cloud", authors: [], affiliations: [], topics: ["hpc", "cloud-infra"] },
];

describe("SC 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(sc.category)).toBe(true);
    expect(VALID_TIERS.has(sc.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(sc.start_date < sc.end_date).toBe(true);
    expect(sc.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sc.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has correct location for Nov 2026", () => {
    expect(sc.location).toBe("Chicago, IL, USA");
    expect(sc.start_date).toBe("2026-11-15");
    expect(sc.end_date).toBe("2026-11-20");
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of sc.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });

  it("has 8 workshop sessions", () => {
    expect(sessions).toHaveLength(8);
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
