import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const dpdk = {
  name: "DPDK Summit 2026",
  abbreviation: "DPDK Summit",
  url: "https://events.linuxfoundation.org/dpdk-summit/",
  location: "Stockholm, Sweden",
  start_date: "2026-05-12",
  end_date: "2026-05-13",
  category: "infrastructure",
  tier: "workshop",
  topics: ["ebpf-xdp", "programmable-net", "high-speed-networking", "os-network-stack", "cloud-infra"],
};

const sessions = [
  { title: "Grout: A DPDK-Based Router", authors: ["Christophe Fontaine"], affiliations: ["Red Hat"], topics: ["programmable-net", "high-speed-networking"] },
  { title: "rte_flow Offload for Multi-device", authors: ["Dariusz Sosnowski"], affiliations: ["NVIDIA"], topics: ["high-speed-networking", "programmable-net"] },
  { title: "eBPF Verification for DPDK", authors: ["Alan Jowett"], affiliations: [], topics: ["ebpf-xdp", "programmable-net"] },
  { title: "Zero-Copy Transfer Between Processes", authors: ["Anatoly Burakov"], affiliations: ["Intel"], topics: ["high-speed-networking", "os-network-stack"] },
  { title: "DPU/XPU Crypto Offload", authors: ["Fan Zhang"], affiliations: ["Intel"], topics: ["high-speed-networking", "cloud-infra"] },
  { title: "K8s Routing with DPDK", authors: ["Robin Jarry"], affiliations: ["Red Hat"], topics: ["cloud-infra", "programmable-net"] },
  { title: "DPI Integration with DPDK", authors: [], affiliations: [], topics: ["high-speed-networking", "programmable-net"] },
  { title: "RISC-V DPDK Port", authors: [], affiliations: [], topics: ["os-network-stack", "programmable-net"] },
  { title: "DPDK at CERN", authors: [], affiliations: ["CERN"], topics: ["high-speed-networking", "cloud-infra"] },
  { title: "Telco Edge with DPDK", authors: [], affiliations: ["Ericsson"], topics: ["cloud-infra", "high-speed-networking"] },
  { title: "DPDK CI/Testing", authors: [], affiliations: ["UNH-IOL"], topics: ["programmable-net"] },
];

describe("DPDK Summit 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(dpdk.category)).toBe(true);
    expect(VALID_TIERS.has(dpdk.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(dpdk.start_date < dpdk.end_date).toBe(true);
    expect(dpdk.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dpdk.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of dpdk.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });

  it("has 11 sessions (7 day1 + 4 day2)", () => {
    expect(sessions).toHaveLength(11);
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

  it("session topics are subset of conference topics", () => {
    const confTopics = new Set(dpdk.topics);
    for (const s of sessions) {
      for (const t of s.topics) {
        expect(confTopics.has(t), `session "${s.title}" topic "${t}" not in conference topics`).toBe(true);
      }
    }
  });
});
