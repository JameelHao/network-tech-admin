import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));

const sessions = [
  { title: "Heap Localization: Cache Side-Channel based Linux Kernel Heap Exploit Techniques", authors: ["Yoochan Lee", "Sihyun Roh", "Hyuk Kwon", "Byoungyoung Lee", "Thorsten Holz"], affiliations: ["Seoul National University", "KAIST"], topics: ["side-channels", "os-network-stack"] },
  { title: "EyeSpy: Inferring Eye Gaze via Side-Channel Attacks Against Foveated Rendering", authors: ["Paul Maynard", "Harris Amjad", "Camila Molinares", "Bo Ji", "Brendan David-John"], affiliations: ["Virginia Tech"], topics: ["side-channels", "privacy-anonymity"] },
  { title: "TDXRay: Microarchitectural Side-Channel Analysis of Intel TDX for Real-World Workloads", authors: ["Tristan Hornetz", "Hosein Yavarzadeh", "Albert Cheu", "Adria Gascon", "Lukas Gerlach", "Daniel Moghimi", "Phillipp Schoppmann", "Michael Schwarz", "Ruiyi Zhang"], affiliations: ["CISPA Helmholtz Center for Information Security", "UC San Diego", "Google"], topics: ["side-channels", "cloud-infra"] },
  { title: "One Tap to Hijack Them All: A Security Analysis of the Google Fast Pair Protocol", authors: ["Sayon Duttagupta", "Seppe Wyns", "Nikola Antonijević", "Dave Singelée", "Bart Preneel"], affiliations: ["KU Leuven"], topics: ["protocol-security"] },
  { title: "Privacy-Conscious Algorithm Design via PAC Privacy", authors: ["Mayuri Sridhar", "Xiaochen Zhu", "Srinivas Devadas"], affiliations: ["MIT"], topics: ["privacy-anonymity"] },
  { title: "A Leakage-Free Framework for Private Set Operations", authors: ["Wenhao Wu", "Yuyue Chen", "Bowen Shen", "Peng Yang", "Ximing Fu", "Zoe Lin Jiang", "Junbin Fang"], affiliations: ["Jinan University", "Harbin Institute of Technology"], topics: ["privacy-anonymity", "protocol-security"] },
  { title: "The Fault in Our Drafts: Vulnerabilities in RPKI Specification and Software", authors: ["Oliver Jacobsen", "Tobias Kirsch", "Haya Schulmann", "Niklas Vogel", "Michael Waidner"], affiliations: ["ATHENE", "Goethe-Universität Frankfurt", "Fraunhofer SIT", "TU Darmstadt"], topics: ["dns-bgp", "protocol-security"] },
  { title: "Knocking on the Front Door: An LLM-Guided Systematic Analysis of DNS Query Processing Vulnerabilities", authors: ["Chongrong Li", "Pengfei Zhu", "Yun Li", "Zhanpeng Guo", "Jingyu Li", "Yuncong Hu", "Zhicong Huang", "Cheng Hong"], affiliations: ["Shanghai Jiao Tong University", "Tsinghua University", "Ant Group"], topics: ["dns-bgp", "protocol-security", "network-ai"] },
  { title: "Specializing Language Models for Textual Fuzzing via Reinforcement Learning", authors: ["Jiayi Lin", "Liangcai Su", "Junzhe Li", "Chenxiong Qian"], affiliations: ["University of Hong Kong"], topics: ["protocol-security", "machine-learning"] },
  { title: "Camveil: Unveiling Security Camera Vulnerabilities through Multi-Protocol Coordinated Fuzzing", authors: ["Fuchen Ma", "Yuqiao Yang", "Yuanliang Chen", "Yanyang Zhao", "Ting Chen", "Yu Jiang"], affiliations: ["Tsinghua University", "UESTC"], topics: ["protocol-security"] },
  { title: "Jazzer: Coverage-Guided Fuzzing for Semantic Vulnerabilities in the Java Ecosystem", authors: ["Sergej Dechand", "Tobias Wienand", "Fabian Meumertzheim", "Peter Samarin", "Simon Resch", "Khaled Yakdan", "Thorsten Holz", "Flavio Toffalini"], affiliations: ["Max Planck Institute for Security and Privacy", "Ruhr University Bochum", "Code Intelligence"], topics: ["protocol-security"] },
  { title: "PUFFERDOS: Efficient and Effective Attack String Generation for Regular Expression Denial of Service Vulnerabilities", authors: ["Shangzhi Xu", "Ziqi Ding", "Xiao Cheng", "Yuekang Li", "Nan Sun", "Benjamin Turnbull", "Shuangxiang Kan", "Siqi Ma"], affiliations: ["UNSW", "CSIRO", "Macquarie University", "University of Wollongong"], topics: ["ddos-defense", "protocol-security"] },
  { title: "Crucible: Retrofitting Commodity CPUs with Vulnerabilities via Transparent Software Emulation", authors: ["Tristan Hornetz", "Lukas Gerlach", "Michael Schwarz"], affiliations: ["CISPA Helmholtz Center for Information Security"], topics: ["side-channels"] },
  { title: "TREVEX: A Black-Box Detection Framework For Data-Flow Transient Execution Vulnerabilities", authors: ["Daniel Weber", "Fabian Thomas", "Leon Trampert", "Ruiyi Zhang", "Michael Schwarz"], affiliations: ["CISPA Helmholtz Center for Information Security"], topics: ["side-channels"] },
  { title: "SoK: Robustness in Large Language Models against Jailbreak Attacks", authors: ["Feiyue Xu", "Hongsheng Hu", "Chaoxiang He", "Sheng Hang", "Hanqing Hu", "Xiuming Liu", "Yubo Zhao", "Zhengyan Zhou", "Bin Benjamin Zhu", "Shi-Feng Sun", "Dawu Gu", "Shuo Wang"], affiliations: ["Shanghai Jiao Tong University", "Microsoft"], topics: ["network-ai", "machine-learning"] },
  { title: "Efficient Arithmetic-and-Comparison Homomorphic Encryption with Space Switching", authors: [], affiliations: [], topics: ["privacy-anonymity", "protocol-security"] },
];

describe("IEEE S&P 2026 session seed data", () => {
  it("has 16 sessions", () => {
    expect(sessions).toHaveLength(16);
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

  it("has arrays for authors and affiliations on every session", () => {
    for (const s of sessions) {
      expect(Array.isArray(s.authors)).toBe(true);
      expect(Array.isArray(s.affiliations)).toBe(true);
    }
  });

  it("covers core S&P topic areas", () => {
    const covered = new Set(sessions.flatMap((s) => s.topics));
    expect(covered.has("side-channels")).toBe(true);
    expect(covered.has("protocol-security")).toBe(true);
    expect(covered.has("privacy-anonymity")).toBe(true);
    expect(covered.has("dns-bgp")).toBe(true);
    expect(covered.has("ddos-defense")).toBe(true);
  });
});
