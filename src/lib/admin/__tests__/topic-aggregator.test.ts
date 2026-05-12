import { describe, it, expect } from "vitest";
import { aggregateTopics, detectDuplicates, type TopicStat } from "../topic-aggregator";

const papers = [
  { id: "p1", title: "Paper A", topics: ["dc-networking", "sdn-nfv"] },
  { id: "p2", title: "Paper B", topics: ["dc-networking"] },
  { id: "p3", title: "Paper C", topics: ["edge-computing"] },
];

const conferences = [
  { id: "c1", name: "SIGCOMM", topics: ["dc-networking", "transport-protocols"] },
  { id: "c2", name: "NSDI", topics: ["distributed-sys"] },
];

const talents = [
  { id: "t1", name: "Alice", topics: ["dc-networking"] },
  { id: "t2", name: "Bob", topics: ["edge-computing", "network-ai"] },
];

const opensource = [
  { id: "o1", name: "Cilium", topics: ["ebpf-xdp", "dc-networking"] },
];

describe("aggregateTopics", () => {
  const stats = aggregateTopics(papers, conferences, talents, opensource);
  const bySlug = new Map(stats.map((s) => [s.slug, s]));

  it("aggregates counts across entities", () => {
    const dc = bySlug.get("dc-networking")!;
    expect(dc.counts.papers).toBe(2);
    expect(dc.counts.conferences).toBe(1);
    expect(dc.counts.talents).toBe(1);
    expect(dc.counts.opensource).toBe(1);
    expect(dc.total).toBe(5);
  });

  it("collects item references", () => {
    const dc = bySlug.get("dc-networking")!;
    expect(dc.items.papers).toHaveLength(2);
    expect(dc.items.papers[0]).toEqual({ id: "p1", title: "Paper A" });
    expect(dc.items.conferences[0]).toEqual({ id: "c1", name: "SIGCOMM" });
    expect(dc.items.talents[0]).toEqual({ id: "t1", name: "Alice" });
    expect(dc.items.opensource[0]).toEqual({ id: "o1", name: "Cilium" });
  });

  it("assigns category from TOPIC_MAP", () => {
    const dc = bySlug.get("dc-networking")!;
    expect(dc.category).toBe("network-systems");

    const edge = bySlug.get("edge-computing")!;
    expect(edge.category).toBe("emerging");
  });

  it("assigns 'other' for unknown topics", () => {
    const data = aggregateTopics(
      [{ id: "x", title: "X", topics: ["unknown-topic"] }],
      [],
      [],
      [],
    );
    expect(data[0].category).toBe("other");
  });

  it("returns all unique topics", () => {
    const slugs = stats.map((s) => s.slug).sort();
    expect(slugs).toEqual([
      "dc-networking",
      "distributed-sys",
      "ebpf-xdp",
      "edge-computing",
      "network-ai",
      "sdn-nfv",
      "transport-protocols",
    ]);
  });

  it("handles empty inputs", () => {
    const result = aggregateTopics([], [], [], []);
    expect(result).toEqual([]);
  });

  it("handles items with empty topics arrays", () => {
    const result = aggregateTopics(
      [{ id: "p1", title: "No topics", topics: [] }],
      [],
      [],
      [],
    );
    expect(result).toEqual([]);
  });
});

describe("detectDuplicates", () => {
  it("marks topics with same normalized form as duplicates", () => {
    const input: TopicStat[] = [
      {
        slug: "machine-learning",
        category: "emerging",
        counts: { papers: 1, conferences: 0, talents: 0, opensource: 0 },
        total: 1,
        items: { papers: [{ id: "p1", title: "P1" }], conferences: [], talents: [], opensource: [] },
      },
      {
        slug: "machinelearning",
        category: "other",
        counts: { papers: 0, conferences: 1, talents: 0, opensource: 0 },
        total: 1,
        items: { papers: [], conferences: [{ id: "c1", name: "C1" }], talents: [], opensource: [] },
      },
    ];
    const result = detectDuplicates(input);
    expect(result[0].duplicateGroup).toBe("machinelearning");
    expect(result[1].duplicateGroup).toBe("machinelearning");
  });

  it("does not mark unique topics", () => {
    const input: TopicStat[] = [
      {
        slug: "dc-networking",
        category: "network-systems",
        counts: { papers: 1, conferences: 0, talents: 0, opensource: 0 },
        total: 1,
        items: { papers: [{ id: "p1", title: "P1" }], conferences: [], talents: [], opensource: [] },
      },
      {
        slug: "edge-computing",
        category: "emerging",
        counts: { papers: 0, conferences: 1, talents: 0, opensource: 0 },
        total: 1,
        items: { papers: [], conferences: [{ id: "c1", name: "C1" }], talents: [], opensource: [] },
      },
    ];
    const result = detectDuplicates(input);
    expect(result[0].duplicateGroup).toBeUndefined();
    expect(result[1].duplicateGroup).toBeUndefined();
  });

  it("handles dots and hyphens in normalization", () => {
    const input: TopicStat[] = [
      {
        slug: "5g-6g",
        category: "emerging",
        counts: { papers: 1, conferences: 0, talents: 0, opensource: 0 },
        total: 1,
        items: { papers: [{ id: "p1", title: "P1" }], conferences: [], talents: [], opensource: [] },
      },
      {
        slug: "5g.6g",
        category: "other",
        counts: { papers: 0, conferences: 1, talents: 0, opensource: 0 },
        total: 1,
        items: { papers: [], conferences: [{ id: "c1", name: "C1" }], talents: [], opensource: [] },
      },
    ];
    const result = detectDuplicates(input);
    expect(result[0].duplicateGroup).toBe("5g6g");
    expect(result[1].duplicateGroup).toBe("5g6g");
  });

  it("handles empty input", () => {
    expect(detectDuplicates([])).toEqual([]);
  });
});
