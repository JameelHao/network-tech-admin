import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const sigcomm = {
  name: "ACM SIGCOMM 2026",
  abbreviation: "SIGCOMM",
  url: "https://conferences.sigcomm.org/sigcomm/2026/",
  location: "Denver, CO, USA",
  start_date: "2026-08-17",
  end_date: "2026-08-21",
  category: "network-systems",
  tier: "top",
  topics: ["dc-networking", "transport-protocols", "sdn-nfv"],
};

const sessions = [
  { title: "[Workshop] Networks for AI Computing (NAIC)", topics: ["dc-networking", "network-ai"] },
  { title: "[Workshop] LEO Networking and Communication (LEO-NET)", topics: ["transport-protocols", "dc-networking"] },
  { title: "[Workshop] Formal Methods Aided Network Operation (FMANO)", topics: ["sdn-nfv", "network-monitoring"] },
  { title: "[Workshop] eBPF and Kernel Extensions", topics: ["ebpf-xdp", "programmable-net"] },
  { title: "[Workshop] Emerging Multimedia Systems (EMS)", topics: ["transport-protocols", "dc-networking"] },
  { title: "[Workshop] Memory-Semantic Networking for AI-Scale Systems (MemNetAI)", topics: ["dc-networking", "high-speed-networking"] },
  { title: "[Workshop] Memory, Systems and Interconnect Co-design for AI (MOSAIC)", topics: ["dc-networking", "high-speed-networking", "network-ai"] },
  { title: "[Workshop] Negative Results in Network Measurements (NetNeg)", topics: ["internet-measure", "network-monitoring"] },
  { title: "[Workshop] Next-Generation Network Observability (NGNO)", topics: ["network-monitoring", "programmable-net"] },
  { title: "[Workshop] Open Research Infrastructures and Toolkits for 6G (OpenRIT6G)", topics: ["5g-6g", "programmable-net"] },
  { title: "[Workshop] Quantum Networks and Distributed Quantum Computing (QuNet)", topics: ["dc-networking", "distributed-sys"] },
  { title: "[Tutorial] BPFChain — Building Safe Multi-Program eBPF Environments", topics: ["ebpf-xdp", "programmable-net"] },
  { title: "[Tutorial] NIO-VE: A View from the Edge", topics: ["edge-computing", "dc-networking"] },
];

describe("ACM SIGCOMM 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(sigcomm.category)).toBe(true);
    expect(VALID_TIERS.has(sigcomm.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(sigcomm.start_date < sigcomm.end_date).toBe(true);
    expect(sigcomm.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sigcomm.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has correct location and dates for Aug 2026", () => {
    expect(sigcomm.location).toBe("Denver, CO, USA");
    expect(sigcomm.start_date).toBe("2026-08-17");
    expect(sigcomm.end_date).toBe("2026-08-21");
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of sigcomm.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });

  it("has 13 sessions (11 workshops + 2 tutorials)", () => {
    expect(sessions).toHaveLength(13);
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
