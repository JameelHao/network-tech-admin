import { describe, it, expect } from "vitest";
import {
  jaccardSimilarity,
  findSimilarPapers,
  clusterByTopics,
  computePaperStats,
} from "../paper-utils";
import type { Paper } from "../types";

function makePaper(overrides: Partial<Paper> = {}): Paper {
  return {
    id: "1",
    title: "Test Paper",
    authors: ["Author A"],
    venue: null,
    url: null,
    published_date: "2026-01-15",
    abstract: null,
    topics: ["cs.NI"],
    citation_count: null,
    source: null,
    notes: null,
    created_at: "2026-01-01",
    ...overrides,
  };
}

describe("jaccardSimilarity", () => {
  it("returns 1 for identical sets", () => {
    expect(jaccardSimilarity(["a", "b"], ["a", "b"])).toBe(1);
  });

  it("returns 0 for disjoint sets", () => {
    expect(jaccardSimilarity(["a", "b"], ["c", "d"])).toBe(0);
  });

  it("returns correct value for partial overlap", () => {
    expect(jaccardSimilarity(["a", "b", "c"], ["b", "c", "d"])).toBeCloseTo(0.5);
  });

  it("returns 0 for two empty sets", () => {
    expect(jaccardSimilarity([], [])).toBe(0);
  });

  it("returns 0 for one empty set", () => {
    expect(jaccardSimilarity(["a"], [])).toBe(0);
  });

  it("handles single element sets", () => {
    expect(jaccardSimilarity(["a"], ["a"])).toBe(1);
    expect(jaccardSimilarity(["a"], ["b"])).toBe(0);
  });
});

describe("findSimilarPapers", () => {
  const target = makePaper({ id: "target", topics: ["cs.NI", "cs.AI"] });
  const papers = [
    target,
    makePaper({ id: "high", topics: ["cs.NI", "cs.AI"] }),
    makePaper({ id: "medium", topics: ["cs.NI", "cs.SE"] }),
    makePaper({ id: "low", topics: ["cs.DB"] }),
    makePaper({ id: "partial", topics: ["cs.AI", "cs.SE", "cs.NI"] }),
  ];

  it("excludes the target paper itself", () => {
    const result = findSimilarPapers(target, papers);
    expect(result.find((p) => p.id === "target")).toBeUndefined();
  });

  it("filters by threshold (0.3)", () => {
    const result = findSimilarPapers(target, papers);
    for (const p of result) {
      expect(p.similarity).toBeGreaterThan(0.3);
    }
    expect(result.find((p) => p.id === "low")).toBeUndefined();
  });

  it("sorts by similarity descending", () => {
    const result = findSimilarPapers(target, papers);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].similarity).toBeGreaterThanOrEqual(result[i].similarity);
    }
  });

  it("respects limit parameter", () => {
    const result = findSimilarPapers(target, papers, 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it("returns empty for no matches", () => {
    const isolated = makePaper({ id: "isolated", topics: ["unique.topic"] });
    const result = findSimilarPapers(isolated, papers);
    expect(result).toHaveLength(0);
  });
});

describe("clusterByTopics", () => {
  it("groups papers by single topic", () => {
    const papers = [
      makePaper({ id: "1", topics: ["cs.NI"] }),
      makePaper({ id: "2", topics: ["cs.NI"] }),
      makePaper({ id: "3", topics: ["cs.AI"] }),
    ];
    const clusters = clusterByTopics(papers);
    expect(clusters.length).toBeGreaterThanOrEqual(2);
    const niCluster = clusters.find((c) => c.topic === "cs.NI");
    expect(niCluster?.count).toBe(2);
  });

  it("creates cross-topic group for multi-topic papers", () => {
    const papers = [
      makePaper({ id: "1", topics: ["cs.NI", "cs.AI"] }),
      makePaper({ id: "2", topics: ["cs.NI", "cs.AI"] }),
    ];
    const clusters = clusterByTopics(papers);
    const cross = clusters.find((c) => c.topic.includes("+"));
    expect(cross).toBeDefined();
    expect(cross!.count).toBe(2);
  });

  it("falls back to primary topic for single cross-topic paper", () => {
    const papers = [
      makePaper({ id: "1", topics: ["cs.NI", "cs.AI"] }),
    ];
    const clusters = clusterByTopics(papers);
    expect(clusters.some((c) => c.papers.some((p) => p.id === "1"))).toBe(true);
  });

  it("returns empty for empty input", () => {
    expect(clusterByTopics([])).toEqual([]);
  });

  it("sorts clusters by count descending", () => {
    const papers = [
      makePaper({ id: "1", topics: ["cs.NI"] }),
      makePaper({ id: "2", topics: ["cs.NI"] }),
      makePaper({ id: "3", topics: ["cs.NI"] }),
      makePaper({ id: "4", topics: ["cs.AI"] }),
    ];
    const clusters = clusterByTopics(papers);
    for (let i = 1; i < clusters.length; i++) {
      expect(clusters[i - 1].count).toBeGreaterThanOrEqual(clusters[i].count);
    }
  });

  it("handles papers with no topics", () => {
    const papers = [makePaper({ id: "1", topics: [] })];
    const clusters = clusterByTopics(papers);
    expect(clusters.length).toBe(1);
    expect(clusters[0].topic).toBe("uncategorized");
  });

  it("includes dateRange", () => {
    const papers = [
      makePaper({ id: "1", topics: ["cs.NI"], published_date: "2026-01-15" }),
      makePaper({ id: "2", topics: ["cs.NI"], published_date: "2026-03-20" }),
    ];
    const clusters = clusterByTopics(papers);
    const c = clusters.find((cl) => cl.topic === "cs.NI");
    expect(c?.dateRange).toBe("2026-01 ~ 2026-03");
  });
});

describe("computePaperStats", () => {
  const NOW = new Date("2026-05-14T12:00:00Z").getTime();

  it("returns total count", () => {
    const papers = [makePaper({ id: "1" }), makePaper({ id: "2" }), makePaper({ id: "3" })];
    expect(computePaperStats(papers, NOW).total).toBe(3);
  });

  it("returns 0 for empty array", () => {
    const stats = computePaperStats([], NOW);
    expect(stats.total).toBe(0);
    expect(stats.thisWeek).toBe(0);
    expect(stats.arxivCount).toBe(0);
    expect(stats.venueCount).toBe(0);
  });

  it("counts papers published within last 7 days", () => {
    const papers = [
      makePaper({ id: "1", published_date: "2026-05-14" }),
      makePaper({ id: "2", published_date: "2026-05-10" }),
      makePaper({ id: "3", published_date: "2026-05-01" }),
      makePaper({ id: "4", published_date: "2026-04-01" }),
    ];
    expect(computePaperStats(papers, NOW).thisWeek).toBe(2);
  });

  it("excludes papers with null published_date from thisWeek", () => {
    const papers = [
      makePaper({ id: "1", published_date: null }),
      makePaper({ id: "2", published_date: "2026-05-14" }),
    ];
    expect(computePaperStats(papers, NOW).thisWeek).toBe(1);
  });

  it("counts arxiv source papers", () => {
    const papers = [
      makePaper({ id: "1", source: "arxiv" }),
      makePaper({ id: "2", source: "arxiv" }),
      makePaper({ id: "3", source: "semantic-scholar" }),
      makePaper({ id: "4", source: null }),
    ];
    expect(computePaperStats(papers, NOW).arxivCount).toBe(2);
  });

  it("counts semantic-scholar source papers", () => {
    const papers = [
      makePaper({ id: "1", source: "arxiv" }),
      makePaper({ id: "2", source: "semantic-scholar" }),
      makePaper({ id: "3", source: "semantic-scholar" }),
    ];
    expect(computePaperStats(papers, NOW).venueCount).toBe(2);
  });

  it("handles papers with unknown source", () => {
    const papers = [makePaper({ id: "1", source: "other" })];
    const stats = computePaperStats(papers, NOW);
    expect(stats.arxivCount).toBe(0);
    expect(stats.venueCount).toBe(0);
    expect(stats.total).toBe(1);
  });

  it("boundary: paper exactly 7 days ago is included in thisWeek", () => {
    const weekAgo = new Date(NOW - 7 * 86_400_000).toISOString().slice(0, 10);
    const papers = [makePaper({ id: "1", published_date: weekAgo })];
    expect(computePaperStats(papers, NOW).thisWeek).toBe(1);
  });

  it("boundary: paper 8 days ago is excluded from thisWeek", () => {
    const eightDaysAgo = new Date(NOW - 8 * 86_400_000).toISOString().slice(0, 10);
    const papers = [makePaper({ id: "1", published_date: eightDaysAgo })];
    expect(computePaperStats(papers, NOW).thisWeek).toBe(0);
  });
});
