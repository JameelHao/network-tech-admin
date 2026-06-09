import { describe, it, expect } from "vitest";
import { computePaperStats } from "../paper-utils";
import type { Paper } from "../types";
import { readFileSync } from "fs";
import { join } from "path";

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

const NOW = new Date("2026-05-14T12:00:00Z").getTime();

describe("paper count consistency", () => {
  describe("computePaperStats totalOverride", () => {
    it("uses totalOverride when provided", () => {
      const papers = [makePaper({ id: "1" }), makePaper({ id: "2" })];
      const stats = computePaperStats(papers, NOW, 500);
      expect(stats.total).toBe(500);
    });

    it("falls back to papers.length when totalOverride is undefined", () => {
      const papers = [makePaper({ id: "1" }), makePaper({ id: "2" })];
      const stats = computePaperStats(papers, NOW);
      expect(stats.total).toBe(2);
    });

    it("totalOverride does not affect other stats", () => {
      const papers = [
        makePaper({ id: "1", source: "arxiv", published_date: "2026-05-14" }),
        makePaper({ id: "2", source: "semantic-scholar", published_date: "2026-01-01" }),
      ];
      const stats = computePaperStats(papers, NOW, 1000);
      expect(stats.total).toBe(1000);
      expect(stats.thisWeek).toBe(1);
      expect(stats.arxivCount).toBe(1);
      expect(stats.venueCount).toBe(1);
    });

    it("totalOverride 0 is respected", () => {
      const papers = [makePaper({ id: "1" })];
      const stats = computePaperStats(papers, NOW, 0);
      expect(stats.total).toBe(0);
    });
  });

  describe("listAllPapers return shape", () => {
    const papersTs = readFileSync(
      join(process.cwd(), "src/lib/admin/papers.ts"),
      "utf-8",
    );

    it("returns { papers, total } object", () => {
      expect(papersTs).toContain("Promise<{ papers: Paper[]; total: number }>");
    });

    it("uses count: exact for accurate total", () => {
      expect(papersTs).toContain('select("*", { count: "exact" })');
    });
  });

  describe("listAllPapersLight has no limit", () => {
    const papersTs = readFileSync(
      join(process.cwd(), "src/lib/admin/papers.ts"),
      "utf-8",
    );

    it("does not limit results", () => {
      const fnMatch = papersTs.match(/listAllPapersLight[\s\S]*?return/);
      expect(fnMatch).toBeTruthy();
      expect(fnMatch![0]).not.toContain(".limit(");
    });
  });

  describe("getPaperCount function", () => {
    const papersTs = readFileSync(
      join(process.cwd(), "src/lib/admin/papers.ts"),
      "utf-8",
    );

    it("exists and uses head: true for efficient count", () => {
      expect(papersTs).toContain("async function getPaperCount()");
      expect(papersTs).toContain("count: \"exact\", head: true");
    });
  });

  describe("insights page uses getPaperCount", () => {
    const insightsTs = readFileSync(
      join(process.cwd(), "src/app/admin/insights/page.tsx"),
      "utf-8",
    );

    it("imports getPaperCount from papers", () => {
      expect(insightsTs).toContain("getPaperCount");
      expect(insightsTs).toContain("from \"@/lib/admin/papers\"");
    });

    it("does not derive paperTotal from trend reduce", () => {
      expect(insightsTs).not.toContain("paperTrend.reduce");
    });
  });

  describe("papers page uses totalOverride", () => {
    const papersPageTs = readFileSync(
      join(process.cwd(), "src/app/admin/papers/page.tsx"),
      "utf-8",
    );

    it("destructures total from fetchAndSyncPapers", () => {
      expect(papersPageTs).toContain("total:");
      expect(papersPageTs).toContain("listAllPapers()");
    });

    it("passes dbTotal to computePaperStats", () => {
      expect(papersPageTs).toContain("dbTotal");
      expect(papersPageTs).toContain("computePaperStats(papers");
    });
  });
});
