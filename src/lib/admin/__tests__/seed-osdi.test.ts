import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));
const VALID_CATEGORIES = new Set(["network-systems", "measurement", "security", "emerging", "infrastructure"]);
const VALID_TIERS = new Set(["top", "good", "workshop"]);

const osdi = {
  name: "USENIX OSDI 2026",
  abbreviation: "OSDI",
  url: "https://www.usenix.org/conference/osdi26",
  location: "Seattle, WA, USA",
  start_date: "2026-07-13",
  end_date: "2026-07-15",
  category: "infrastructure",
  tier: "top",
  topics: ["distributed-sys", "os-network-stack", "storage-net", "cloud-infra"],
};

const sessions = [
  { title: "OpenTela: Unifying Decentralized HPC Clusters for Heterogeneous LLM Serving", authors: ["Xiaozhe Yao", "Youhe Jiang", "Ilia Badanin", "Qinghao Hu", "Binhang Yuan", "Eiko Yoneki", "Imanol Schlag", "Ana Klimovic"], affiliations: ["ETH Zurich", "University of Cambridge", "EPFL", "MIT", "HKUST"], topics: ["distributed-sys", "cloud-infra", "hpc"] },
  { title: "RoCE BALBOA: Service-Enhanced RDMA Offload Engine for Data Center SmartNICs", authors: ["Maximilian Heer", "Benjamin Ramhorst", "Yu Zhu", "Luhao Liu", "Zhiyi Hu", "Jonas Dann", "Gustavo Alonso"], affiliations: ["ETH Zurich"], topics: ["dc-networking", "high-speed-networking", "cloud-infra"] },
  { title: "Simple is Better: Multiplication May Be All You Need for LLM Request Scheduling", authors: ["Dingyan Zhang", "Jinbo Han", "Kaixi Zhang", "Xingda Wei", "Sijie Shen", "Chenguang Fang", "Wenyuan Yu", "Jingren Zhou", "Rong Chen"], affiliations: ["SJTU", "Alibaba"], topics: ["distributed-sys", "cloud-infra"] },
  { title: "Breaking the Reward Barrier: Accelerating Tree-of-Thought Reasoning via Speculative Exploration", authors: ["Meng Li"], affiliations: ["Peking University"], topics: ["distributed-sys", "cloud-infra"] },
  { title: "[Pending] Sun Yat-sen University Systems — OSDI'26", authors: ["Jiangsu Du", "Hongbin Zhang", "Taosheng Wei", "Zhenyi Zheng", "Jiazhi Jiang", "Kaiyi Wu", "Zhiguang Chen", "Yutong Lu"], affiliations: ["Sun Yat-sen University"], topics: ["distributed-sys", "cloud-infra"] },
  { title: "[Pending] Sun Yat-sen / HKUST Distributed Systems — OSDI'26", authors: ["Yapeng Jiang", "Mingyuan Gan", "Zicong Hong", "Wuhui Chen", "Junyuan Liang", "Yue Yu", "Meng Guo", "Zibin Zheng"], affiliations: ["Sun Yat-sen University", "HKUST", "Pengcheng Laboratory", "Qilu University of Technology"], topics: ["distributed-sys", "cloud-infra"] },
  { title: "[Pending] UC Berkeley / NVIDIA / UPenn / UT Austin Systems — OSDI'26", authors: ["Jaewan Hong", "Marcos K. Aguilera", "Vincent Liu", "Christopher J. Rossbach"], affiliations: ["UC Berkeley", "NVIDIA", "University of Pennsylvania", "UT Austin", "Microsoft"], topics: ["distributed-sys", "os-network-stack"] },
  { title: "[Pending] UC Berkeley Security/Systems — OSDI'26", authors: ["Ryan Cottone", "Darya Kaviani", "Conor Power", "Will Giorza", "Evelyn Koo", "Natacha Crooks", "Raluca Popa"], affiliations: ["UC Berkeley", "Stanford"], topics: ["distributed-sys", "cloud-infra"] },
];

describe("USENIX OSDI 2026 seed data", () => {
  it("has valid category and tier", () => {
    expect(VALID_CATEGORIES.has(osdi.category)).toBe(true);
    expect(VALID_TIERS.has(osdi.tier)).toBe(true);
  });

  it("has valid date range", () => {
    expect(osdi.start_date < osdi.end_date).toBe(true);
    expect(osdi.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(osdi.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has correct location and dates for Jul 2026", () => {
    expect(osdi.location).toBe("Seattle, WA, USA");
    expect(osdi.start_date).toBe("2026-07-13");
    expect(osdi.end_date).toBe("2026-07-15");
  });

  it("has all conference topics in TOPICS registry", () => {
    for (const t of osdi.topics) {
      expect(VALID_SLUGS.has(t), `unknown topic: ${t}`).toBe(true);
    }
  });

  it("has 8 sessions", () => {
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

  it("every session has at least one author with affiliation", () => {
    for (const s of sessions) {
      expect(s.authors.length).toBeGreaterThan(0);
      expect(s.affiliations.length).toBeGreaterThan(0);
    }
  });
});
