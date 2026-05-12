import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));

const sessions = [
  { title: "Crack in the Armor: Underlying Infrastructure Threats to RPKI Publication Point Reachability", authors: ["Yunhao Liu", "Jessie Hui Wang", "Yuedong Xu", "Zongpeng Li", "Yangyang Wang", "Jilong Wang"], affiliations: ["Tsinghua University", "Zhongguancun Laboratory", "Fudan University"], topics: ["dns-bgp", "protocol-security"] },
  { title: "Demystifying RPKI-Invalid Prefixes: Hidden Causes and Security Risks", authors: ["Weitong Li", "Tao Wan", "Tijay Chung"], affiliations: ["Virginia Tech", "CableLabs"], topics: ["dns-bgp", "protocol-security"] },
  { title: "Should I Trust You? Rethinking the Principle of Zone-Based Isolation DNS Bailiwick Checking", authors: ["Yuxiao Wu", "Yunkai Zou", "Ding Wang", "Fei Duan", "Chaoyi Lu", "Baojun Liu"], affiliations: ["Tsinghua University", "Nankai University", "Zhongguancun Laboratory"], topics: ["dns-bgp", "protocol-security"] },
  { title: "Continuous User Behavior Monitoring using DNS Cache Timing Attacks", authors: ["Hannes Weissteiner", "Roland Czerny", "Simone Franza", "Stefan Gast", "Johanna Ullrich", "Daniel Gruss"], affiliations: ["Graz University of Technology"], topics: ["dns-bgp", "side-channels", "privacy-anonymity"] },
  { title: "ACTS: Attestations of Contents in TLS Sessions", authors: ["Pierpaolo Della Monica", "Ivan Visconti", "Andrea Vitaletti", "Marco Zecchini"], affiliations: ["University of Salerno", "Sapienza University of Rome"], topics: ["protocol-security", "privacy-anonymity"] },
  { title: "Aliens Among Us: Observing Private or Reserved IPs on the Public Internet", authors: ["Radu Anghel", "Carlos Gañán", "Qasim Lone", "Matthew Luckie", "Yury Zhauniarovich"], affiliations: ["Delft University of Technology", "University of Waikato"], topics: ["internet-measure", "dns-bgp"] },
  { title: "NetRadar: Enabling Robust Carpet Bombing DDoS Detection", authors: ["Junchen Pan", "Lei Zhang", "Xiaoyong Si", "Jie Zhang", "Xinggong Zhang", "Yong Cui"], affiliations: ["Tsinghua University", "Zhongguancun Laboratory", "Tencent Technology", "Peking University"], topics: ["ddos-defense", "network-monitoring"] },
  { title: "WiFinger: Fingerprinting Noisy IoT Event Traffic Using Packet-level Sequence Matching", authors: ["Ronghua Li", "Shinan Liu", "Haibo Hu", "Qingqing Ye"], affiliations: ["Hong Kong Polytechnic University", "University of Hong Kong"], topics: ["traffic-analysis", "privacy-anonymity"] },
  { title: "FirmAgent: Leveraging Fuzzing to Assist LLM Agents with IoT Firmware Vulnerability Discovery", authors: ["Jiangan Ji", "Chao Zhang", "Shuitao Gan", "Jian Lin", "Hangtian Liu", "Tieming Liu", "Lei Zheng", "Zhipeng Jia"], affiliations: ["Tsinghua University"], topics: ["protocol-security", "network-ai"] },
  { title: "FirmCross: Detecting Taint-style Vulnerabilities in Modern C-Lua Hybrid Web Services of Linux-based Firmware", authors: ["Runhao Liu", "Jiarun Dai", "Haoyu Xiao", "Yuan Zhang", "Yeqi Mou", "Lukai Xu", "Bo Yu", "Baosheng Wang", "Min Yang"], affiliations: ["National University of Defense Technology", "Fudan University"], topics: ["protocol-security"] },
  { title: "Fuzzilicon: A Post-Silicon Microcode-Guided x86 CPU Fuzzer", authors: ["Johannes Lenzen", "Mohamadreza Rostami", "Lichao Wu", "Ahmad-Reza Sadeghi"], affiliations: ["Technical University of Darmstadt"], topics: ["side-channels", "protocol-security"] },
  { title: "One Email, Many Faces: A Deep Dive into Identity Confusion in Email Aliases", authors: ["Mengying Wu", "Geng Hong", "Jiatao Chen", "Baojun Liu", "Mingxuan Liu", "Min Yang"], affiliations: ["Fudan University", "Tsinghua University", "Zhongguancun Laboratory"], topics: ["protocol-security", "privacy-anonymity"] },
  { title: "Consensus in the Known Participation Model with Byzantine Faults and Sleepy Replicas", authors: ["Chenxu Wang", "Sisi Duan", "Minghui Xu", "Feng Li", "Xiuzhen Cheng"], affiliations: ["Shandong University", "Tsinghua University"], topics: ["distributed-sys", "protocol-security"] },
];

describe("NDSS 2026 session seed data", () => {
  it("has 13 sessions", () => {
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

  it("every session has at least one author with affiliation", () => {
    for (const s of sessions) {
      expect(s.authors.length).toBeGreaterThan(0);
      expect(s.affiliations.length).toBeGreaterThan(0);
    }
  });

  it("has arrays for authors and affiliations on every session", () => {
    for (const s of sessions) {
      expect(Array.isArray(s.authors)).toBe(true);
      expect(Array.isArray(s.affiliations)).toBe(true);
    }
  });

  it("covers core NDSS topic areas", () => {
    const covered = new Set(sessions.flatMap((s) => s.topics));
    expect(covered.has("protocol-security")).toBe(true);
    expect(covered.has("dns-bgp")).toBe(true);
    expect(covered.has("ddos-defense")).toBe(true);
    expect(covered.has("privacy-anonymity")).toBe(true);
  });
});
