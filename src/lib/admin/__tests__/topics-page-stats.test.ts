import { describe, it, expect } from "vitest";
import { computeTopicPageStats } from "../topics-utils";
import type { TopicStat } from "../topic-aggregator";

function makeStat(overrides: Partial<TopicStat> = {}): TopicStat {
  return {
    slug: "test-topic",
    category: "network-systems",
    counts: { papers: 0, conferences: 0, talents: 0, opensource: 0 },
    total: 0,
    items: { papers: [], conferences: [], talents: [], opensource: [] },
    ...overrides,
  };
}

describe("computeTopicPageStats", () => {
  it("returns defaults for empty array", () => {
    const stats = computeTopicPageStats([]);
    expect(stats.totalTopics).toBe(0);
    expect(stats.categoryCount).toBe(5);
    expect(stats.activeCount).toBe(0);
    expect(stats.hottestTopic).toBe("—");
  });

  it("counts totalTopics", () => {
    const topics = [
      makeStat({ slug: "a" }),
      makeStat({ slug: "b" }),
      makeStat({ slug: "c" }),
    ];
    expect(computeTopicPageStats(topics).totalTopics).toBe(3);
  });

  it("categoryCount is always 5", () => {
    const topics = [makeStat({ slug: "a" })];
    expect(computeTopicPageStats(topics).categoryCount).toBe(5);
  });

  it("counts active topics (total > 0)", () => {
    const topics = [
      makeStat({ slug: "a", total: 3 }),
      makeStat({ slug: "b", total: 0 }),
      makeStat({ slug: "c", total: 1 }),
    ];
    expect(computeTopicPageStats(topics).activeCount).toBe(2);
  });

  it("returns hottest topic slug", () => {
    const topics = [
      makeStat({ slug: "a", total: 2 }),
      makeStat({ slug: "b", total: 5 }),
      makeStat({ slug: "c", total: 3 }),
    ];
    expect(computeTopicPageStats(topics).hottestTopic).toBe("b");
  });

  it("returns first topic when multiple have same max total", () => {
    const topics = [
      makeStat({ slug: "a", total: 5 }),
      makeStat({ slug: "b", total: 5 }),
    ];
    expect(computeTopicPageStats(topics).hottestTopic).toBe("a");
  });

  it("returns dash when all totals are zero", () => {
    const topics = [
      makeStat({ slug: "a", total: 0 }),
      makeStat({ slug: "b", total: 0 }),
    ];
    expect(computeTopicPageStats(topics).hottestTopic).toBe("—");
  });

  it("counts zero active when all totals are zero", () => {
    const topics = [
      makeStat({ slug: "a", total: 0 }),
      makeStat({ slug: "b", total: 0 }),
    ];
    expect(computeTopicPageStats(topics).activeCount).toBe(0);
  });
});
