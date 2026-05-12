import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const infocom = {
  name: "IEEE INFOCOM 2026",
  abbreviation: "INFOCOM",
  url: "https://infocom2026.ieee-infocom.org/",
  location: "Tokyo, Japan",
  start_date: "2026-05-19",
  end_date: "2026-05-22",
  category: "network-systems",
  tier: "top",
  topics: ["dc-networking", "transport-protocols", "mobile-wireless", "congestion-ctrl"],
};

const sessions = [
  { title: "P2C-MUX: Multiplexing with Power and Polarity Coding for Communication Efficiency", topics: ["transport-protocols", "high-speed-networking"] },
  { title: "Vedrfolnir: RDMA Network Performance Anomalies Diagnosis in Collective Communications", topics: ["dc-networking", "network-monitoring", "hpc"] },
  { title: "Holm: A DPU-Based Robust Host-Side Latency Monitoring with Low-Overhead and Selective Full-Coverage", topics: ["network-monitoring", "dc-networking", "programmable-net"] },
  { title: "Symphony: Enhancing RDMA Connection Scalability through Sender-Receiver Coordination", topics: ["dc-networking", "transport-protocols", "hpc"] },
  { title: "Tlaloc: A Generic Multipath Load Balancing for RoCE", topics: ["dc-networking", "transport-protocols", "congestion-ctrl"] },
  { title: "SF-STACK: Streamlining RDMA for Heterogeneous Telecom Storage", topics: ["storage-net", "dc-networking", "transport-protocols"] },
  { title: "PhOrch: Proactive Phase-Level Flow Path Orchestration For Contention-Free LLM Training", topics: ["dc-networking", "network-ai", "hpc"] },
  { title: "How to Execute Any Computable Function on Programmable Data Plane", topics: ["programmable-net", "sdn-nfv"] },
  { title: "LTD: Low-Overhead Topology Discovery using Programmable Data Planes", topics: ["programmable-net", "network-monitoring", "sdn-nfv"] },
  { title: "ReAct: Reflection Attack Mitigation For Asymmetric Routing", topics: ["ddos-defense", "transport-protocols"] },
  { title: "SkipTrie: Fast IPv6 Lookup with Sub-Trie Skipping", topics: ["high-speed-networking", "programmable-net"] },
  { title: "DS-Route: GNN-based Flow-Level Latency Prediction in Software-Defined LEO Satellite Networks", topics: ["network-ai", "machine-learning", "sdn-nfv"] },
  { title: "FairMEC: Achieving Fair Resource Sharing in Multi-Access Edge Computing Federations", topics: ["edge-computing", "cloud-infra"] },
  { title: "Open RAN Conflict Agents: Detecting and Mitigating xApp Conflicts with Generative Agents", topics: ["sdn-nfv", "5g-6g", "network-ai"] },
  { title: "EExApp: GNN-Based Reinforcement Learning for Radio Unit Energy Optimization in 5G O-RAN", topics: ["5g-6g", "network-ai", "machine-learning"] },
  { title: "Online Fresh Service Caching, Task Offloading, and Resource Allocation in Mobile Edge Computing", topics: ["edge-computing", "optimization"] },
  { title: "Enabling Fast and Stable Service Mesh Communication via Piggyback Layer-7 Traffic Control on Programmable Switches", topics: ["programmable-net", "cloud-infra", "sdn-nfv"] },
  { title: "Online Wireless Scheduling for Throughput Maximization under Unknown Channel Statistics", topics: ["optimization", "5g-6g"] },
  { title: "FedDynMask: Efficient Federated Fine-Tuning for Edge LLMs via Dynamic Sparse Masking", topics: ["edge-computing", "machine-learning", "network-ai"] },
  { title: "SIA: Symbolic Interpretability for Anticipatory Deep Reinforcement Learning in Network Control", topics: ["network-ai", "machine-learning", "sdn-nfv"] },
  { title: "Generative Covert Communication: Leveraging Signal Coupling for Secret Data Transmission", topics: ["protocol-security", "privacy-anonymity"] },
  { title: "FT-PromptFL: A Feature Transmission-based Framework for Communication-Efficient Prompt Federated Learning", topics: ["machine-learning", "edge-computing"] },
  { title: "BlindMap: Explicit Blind-Area Prediction and Request-Free Communication for Efficient Cooperative Perception", topics: ["edge-computing", "network-ai"] },
  { title: "How to Hardware Accelerate Your 5G CU", topics: ["5g-6g", "high-speed-networking"] },
  { title: "SAGE: Self-Reflective End-to-End Framework for Automated APT Investigation in 5G Networks", topics: ["5g-6g", "protocol-security", "network-ai"] },
  { title: "Sluice: End-to-End Latency Guarantee for Long-running Dataflow Systems", topics: ["cloud-infra", "distributed-sys"] },
];

describe("IEEE INFOCOM 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(infocom.category)).toBe(true);
    expect(VALID_TIERS.has(infocom.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(infocom.start_date < infocom.end_date).toBe(true);
    expect(infocom.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(infocom.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has correct location for May 2026", () => {
    expect(infocom.location).toBe("Tokyo, Japan");
    expect(infocom.start_date).toBe("2026-05-19");
    expect(infocom.end_date).toBe("2026-05-22");
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of infocom.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });

  it("has 26 sessions", () => {
    expect(sessions).toHaveLength(26);
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

  it("covers core INFOCOM topic areas", () => {
    const covered = new Set(sessions.flatMap((s) => s.topics));
    expect(covered.has("dc-networking")).toBe(true);
    expect(covered.has("transport-protocols")).toBe(true);
    expect(covered.has("programmable-net")).toBe(true);
    expect(covered.has("network-ai")).toBe(true);
    expect(covered.has("5g-6g")).toBe(true);
  });
});
