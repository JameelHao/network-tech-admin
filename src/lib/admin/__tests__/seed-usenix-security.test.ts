import { describe, it, expect } from "vitest";
import { TOPICS } from "../topics";

const VALID_SLUGS = new Set(TOPICS.map((t) => t.slug));

const CONF_TOPICS = ["protocol-security", "side-channels", "privacy-anonymity", "ddos-defense"];

const sessions = [
  { title: "Zero Knowledge (About) Encryption: A Comparative Security Analysis of Three Cloud-based Password Managers", authors: ["Matteo Scarlata", "Giovanni Torrisi", "Matilda Backendal", "Kenneth Paterson"], affiliations: ["ETH Zurich"], topics: ["protocol-security"] },
  { title: "Analyzing the WebRTC Ecosystem and Breaking Authentication in DTLS-SRTP", authors: [], affiliations: ["ETH Zurich"], topics: ["protocol-security", "side-channels"] },
  { title: "Hop: A Modern Transport and Remote Access Protocol", authors: [], affiliations: [], topics: ["protocol-security"] },
  { title: "LPG: Location Privacy for Direct-to-Cell LEO Satellite Networks", authors: [], affiliations: [], topics: ["privacy-anonymity", "protocol-security"] },
  { title: "SignalCD: End-to-End Encrypted Collaborative Documents", authors: [], affiliations: [], topics: ["privacy-anonymity", "protocol-security"] },
  { title: "SoK: PHILTER — Uncovering Security and Functional Gaps in AI-based Phishing Website Detection Literature via an LLM-based Reasoning Framework", authors: ["Mahbub Alam", "Muhammad Lutfor Rahman", "Sonjoy Kumar Paul", "Amy W. Hays", "Aftab Hussain", "Md Imanul Huq", "Nitesh Saxena"], affiliations: ["Texas A&M University"], topics: ["protocol-security"] },
  { title: "SMASH: Scalable Maliciously Secure Hybrid MPC Framework", authors: [], affiliations: [], topics: ["privacy-anonymity", "protocol-security"] },
  { title: "Heli: Lightweight Aggregate Statistics with Asymmetric Server Costs", authors: [], affiliations: [], topics: ["privacy-anonymity"] },
  { title: "Interpolation-Based Optimization for Enforcing lp-Norm Metric Differential Privacy", authors: [], affiliations: [], topics: ["privacy-anonymity"] },
  { title: "Imitative Membership Inference Attack (IMIA)", authors: ["Yunlv Lv", "Rui Zhang", "Zhiyuan Zhang", "Ziyi Wan"], affiliations: [], topics: ["privacy-anonymity", "side-channels"] },
  { title: "AIOpsDoom: Security Analysis of LLM-based AIOps Agents", authors: [], affiliations: [], topics: ["protocol-security", "side-channels"] },
  { title: "United We Defend: Collaborative Membership Inference Defenses in Federated Learning", authors: [], affiliations: ["Hong Kong Polytechnic University"], topics: ["privacy-anonymity"] },
  { title: "The Prompt Stealing Fallacy: Rethinking Metrics, Attacks, and Defenses", authors: [], affiliations: ["Hong Kong Polytechnic University"], topics: ["privacy-anonymity", "side-channels"] },
  { title: "Mirai Botnet Evolution: From Simple Tools to DDoS-for-Hire Platforms", authors: [], affiliations: [], topics: ["ddos-defense"] },
  { title: "Clinician Security Perspectives in Healthcare", authors: [], affiliations: [], topics: ["protocol-security"] },
];

describe("USENIX Security 2026 session seed data", () => {
  it("has 15 sessions (Cycle 1)", () => {
    expect(sessions).toHaveLength(15);
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
    const confTopics = new Set(CONF_TOPICS);
    for (const s of sessions) {
      for (const t of s.topics) {
        expect(confTopics.has(t), `session "${s.title}" topic "${t}" not in conference topics`).toBe(true);
      }
    }
  });

  it("covers all four conference topic areas", () => {
    const covered = new Set(sessions.flatMap((s) => s.topics));
    for (const t of CONF_TOPICS) {
      expect(covered.has(t), `conference topic "${t}" not covered by any session`).toBe(true);
    }
  });

  it("has arrays for authors and affiliations on every session", () => {
    for (const s of sessions) {
      expect(Array.isArray(s.authors)).toBe(true);
      expect(Array.isArray(s.affiliations)).toBe(true);
    }
  });
});
