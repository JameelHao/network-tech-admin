import { describe, it, expect } from "vitest";
import { computeNewsStats } from "../news-utils";
import type { NewsItem } from "../news";

function makeItem(overrides: Partial<NewsItem> = {}): NewsItem {
  return {
    id: "1",
    title: "Test News",
    link: "https://example.com",
    snippet: null,
    source: null,
    pub_date: null,
    category: "news",
    created_at: "2026-01-01",
    ...overrides,
  };
}

const NOW = new Date("2026-05-14T12:00:00Z").getTime();

describe("computeNewsStats", () => {
  it("returns zeros for empty array", () => {
    const stats = computeNewsStats([], NOW);
    expect(stats.today).toBe(0);
    expect(stats.thisWeek).toBe(0);
  });

  it("counts items published today", () => {
    const items = [
      makeItem({ id: "1", pub_date: "2026-05-14T08:00:00Z" }),
      makeItem({ id: "2", pub_date: "2026-05-14T00:00:00Z" }),
      makeItem({ id: "3", pub_date: "2026-05-13T23:59:59Z" }),
    ];
    expect(computeNewsStats(items, NOW).today).toBe(2);
  });

  it("counts items published within last 7 days", () => {
    const items = [
      makeItem({ id: "1", pub_date: "2026-05-14T08:00:00Z" }),
      makeItem({ id: "2", pub_date: "2026-05-10T00:00:00Z" }),
      makeItem({ id: "3", pub_date: "2026-05-01T00:00:00Z" }),
      makeItem({ id: "4", pub_date: "2026-04-01T00:00:00Z" }),
    ];
    expect(computeNewsStats(items, NOW).thisWeek).toBe(2);
  });

  it("excludes items with null pub_date", () => {
    const items = [
      makeItem({ id: "1", pub_date: null }),
      makeItem({ id: "2", pub_date: "2026-05-14T08:00:00Z" }),
    ];
    const stats = computeNewsStats(items, NOW);
    expect(stats.today).toBe(1);
    expect(stats.thisWeek).toBe(1);
  });

  it("boundary: item exactly 7 days ago is included in thisWeek", () => {
    const weekAgo = new Date(NOW - 7 * 86_400_000).toISOString().slice(0, 10);
    const items = [makeItem({ id: "1", pub_date: weekAgo + "T00:00:00Z" })];
    expect(computeNewsStats(items, NOW).thisWeek).toBe(1);
  });

  it("boundary: item 8 days ago is excluded from thisWeek", () => {
    const eightDaysAgo = new Date(NOW - 8 * 86_400_000).toISOString().slice(0, 10);
    const items = [makeItem({ id: "1", pub_date: eightDaysAgo + "T00:00:00Z" })];
    expect(computeNewsStats(items, NOW).thisWeek).toBe(0);
  });

  it("today items are also counted in thisWeek", () => {
    const items = [makeItem({ id: "1", pub_date: "2026-05-14T10:00:00Z" })];
    const stats = computeNewsStats(items, NOW);
    expect(stats.today).toBe(1);
    expect(stats.thisWeek).toBe(1);
  });

  it("handles date-only pub_date strings", () => {
    const items = [makeItem({ id: "1", pub_date: "2026-05-14" })];
    const stats = computeNewsStats(items, NOW);
    expect(stats.today).toBe(1);
  });

  it("handles items with all null fields", () => {
    const items = [makeItem({ id: "1", pub_date: null, source: null, snippet: null })];
    const stats = computeNewsStats(items, NOW);
    expect(stats.today).toBe(0);
    expect(stats.thisWeek).toBe(0);
  });
});
