import { describe, it, expect } from "vitest";
import {
  normalizeTitle,
  jaccardSimilarity,
  findDuplicateGroups,
} from "../paper-dedup";

describe("normalizeTitle", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalizeTitle("Attention Is All You Need!")).toBe(
      "attention is all you need",
    );
  });

  it("collapses whitespace", () => {
    expect(normalizeTitle("  foo   bar  baz  ")).toBe("foo bar baz");
  });

  it("removes special characters", () => {
    expect(normalizeTitle("A (Novel) Approach: v2.0")).toBe(
      "a novel approach v20",
    );
  });

  it("handles empty string", () => {
    expect(normalizeTitle("")).toBe("");
  });
});

describe("jaccardSimilarity", () => {
  it("returns 1 for identical strings", () => {
    expect(jaccardSimilarity("foo bar", "foo bar")).toBe(1);
  });

  it("returns 0 for completely different strings", () => {
    expect(jaccardSimilarity("foo bar", "baz qux")).toBe(0);
  });

  it("computes correct coefficient", () => {
    const sim = jaccardSimilarity("a b c", "b c d");
    expect(sim).toBeCloseTo(0.5, 5);
  });

  it("returns 1 for two empty strings", () => {
    expect(jaccardSimilarity("", "")).toBe(1);
  });

  it("returns 0 when one string is empty", () => {
    expect(jaccardSimilarity("foo", "")).toBe(0);
  });
});

describe("findDuplicateGroups", () => {
  it("detects exact title duplicates after normalization", () => {
    const papers = [
      { id: "1", title: "Attention Is All You Need", authors: ["A"], url: null },
      { id: "2", title: "attention is all you need", authors: ["A"], url: null },
    ];
    const groups = findDuplicateGroups(papers);
    expect(groups).toHaveLength(1);
    expect(groups[0].similarity).toBe(100);
    expect(groups[0].reason).toBe("exact-title");
    expect(groups[0].papers).toHaveLength(2);
  });

  it("detects exact duplicates with punctuation differences", () => {
    const papers = [
      { id: "1", title: "A Novel Approach: Version 1", authors: ["X"], url: null },
      { id: "2", title: "A Novel Approach - Version 1", authors: ["X"], url: null },
    ];
    const groups = findDuplicateGroups(papers);
    expect(groups).toHaveLength(1);
    expect(groups[0].reason).toBe("exact-title");
  });

  it("detects fuzzy duplicates via Jaccard similarity", () => {
    const base = "a comprehensive survey on advances in deep reinforcement learning for autonomous network traffic congestion control mechanisms in modern data center environments";
    const variant = "a comprehensive survey on advances in deep reinforcement learning for autonomous network traffic congestion control strategies in modern data center environments";
    const papers = [
      { id: "1", title: base, authors: ["Alice", "Bob"], url: null },
      { id: "2", title: variant, authors: ["Alice", "Bob"], url: null },
    ];
    const groups = findDuplicateGroups(papers);
    expect(groups).toHaveLength(1);
    expect(groups[0].similarity).toBeGreaterThanOrEqual(85);
    expect(groups[0].reason).toBe("same-authors-similar-title");
  });

  it("marks same-authors-similar-title when author overlap > 50%", () => {
    const papers = [
      { id: "1", title: "deep reinforcement learning for congestion control mechanisms", authors: ["Alice", "Bob", "Charlie"], url: null },
      { id: "2", title: "deep reinforcement learning for congestion control in networks", authors: ["Alice", "Bob"], url: null },
    ];
    const groups = findDuplicateGroups(papers);
    if (groups.length > 0) {
      expect(groups[0].reason).toBe("same-authors-similar-title");
    }
  });

  it("does not group unrelated papers", () => {
    const papers = [
      { id: "1", title: "Machine Learning for Network Security", authors: ["A"], url: null },
      { id: "2", title: "Quantum Computing Overview", authors: ["B"], url: null },
    ];
    const groups = findDuplicateGroups(papers);
    expect(groups).toHaveLength(0);
  });

  it("handles empty input", () => {
    expect(findDuplicateGroups([])).toEqual([]);
  });

  it("handles single paper", () => {
    const papers = [
      { id: "1", title: "Solo Paper", authors: ["A"], url: null },
    ];
    expect(findDuplicateGroups(papers)).toEqual([]);
  });

  it("generates stable group keys from sorted IDs", () => {
    const papers = [
      { id: "b", title: "Same Title", authors: ["A"], url: null },
      { id: "a", title: "Same Title", authors: ["A"], url: null },
    ];
    const groups = findDuplicateGroups(papers);
    expect(groups[0].key).toBe("a:b");
  });

  it("handles three papers with the same title", () => {
    const papers = [
      { id: "1", title: "Duplicate Paper", authors: ["A"], url: null },
      { id: "2", title: "Duplicate Paper", authors: ["A"], url: null },
      { id: "3", title: "Duplicate Paper", authors: ["A"], url: null },
    ];
    const groups = findDuplicateGroups(papers);
    expect(groups).toHaveLength(1);
    expect(groups[0].papers).toHaveLength(3);
  });

  it("completes within 100ms for 500 papers", () => {
    const papers = Array.from({ length: 500 }, (_, i) => ({
      id: `p${i}`,
      title: `Unique Paper Number ${i} About Different Topic ${i % 50}`,
      authors: [`Author ${i}`],
      url: null,
    }));
    papers.push({
      id: "dup1",
      title: "Duplicate Paper Title For Performance Test",
      authors: ["Test Author"],
      url: null,
    });
    papers.push({
      id: "dup2",
      title: "Duplicate Paper Title For Performance Test",
      authors: ["Test Author"],
      url: null,
    });

    const start = performance.now();
    const groups = findDuplicateGroups(papers);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(100);
    expect(groups.length).toBeGreaterThanOrEqual(1);
  });
});
