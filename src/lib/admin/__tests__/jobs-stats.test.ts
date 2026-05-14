import { describe, it, expect } from "vitest";
import { computeJobStats } from "../jobs-utils";
import type { NewsItem } from "../news";

function makeItem(overrides: Partial<NewsItem> = {}): NewsItem {
  return {
    id: "1",
    title: "Test Job",
    link: "https://example.com",
    snippet: null,
    source: null,
    pub_date: null,
    category: "job",
    created_at: "2026-01-01",
    ...overrides,
  };
}

const NOW = new Date("2026-05-14T12:00:00Z").getTime();

describe("computeJobStats", () => {
  it("returns zeros for empty array", () => {
    const stats = computeJobStats([], NOW);
    expect(stats.total).toBe(0);
    expect(stats.thisWeek).toBe(0);
    expect(stats.active).toBe(0);
    expect(stats.sourceCount).toBe(0);
  });

  it("counts total items", () => {
    const items = [
      makeItem({ id: "1" }),
      makeItem({ id: "2" }),
      makeItem({ id: "3" }),
    ];
    expect(computeJobStats(items, NOW).total).toBe(3);
  });

  it("counts items published within last 7 days", () => {
    const items = [
      makeItem({ id: "1", pub_date: "2026-05-14T08:00:00Z" }),
      makeItem({ id: "2", pub_date: "2026-05-10T00:00:00Z" }),
      makeItem({ id: "3", pub_date: "2026-05-01T00:00:00Z" }),
    ];
    expect(computeJobStats(items, NOW).thisWeek).toBe(2);
  });

  it("counts active items (within last 14 days)", () => {
    const items = [
      makeItem({ id: "1", pub_date: "2026-05-14T08:00:00Z" }),
      makeItem({ id: "2", pub_date: "2026-05-05T00:00:00Z" }),
      makeItem({ id: "3", pub_date: "2026-04-25T00:00:00Z" }),
    ];
    expect(computeJobStats(items, NOW).active).toBe(2);
  });

  it("counts distinct sources", () => {
    const items = [
      makeItem({ id: "1", source: "HN Jobs" }),
      makeItem({ id: "2", source: "RemoteOK" }),
      makeItem({ id: "3", source: "HN Jobs" }),
      makeItem({ id: "4", source: null }),
    ];
    expect(computeJobStats(items, NOW).sourceCount).toBe(2);
  });

  it("excludes items with null pub_date from thisWeek and active", () => {
    const items = [
      makeItem({ id: "1", pub_date: null }),
      makeItem({ id: "2", pub_date: "2026-05-14T08:00:00Z" }),
    ];
    const stats = computeJobStats(items, NOW);
    expect(stats.total).toBe(2);
    expect(stats.thisWeek).toBe(1);
    expect(stats.active).toBe(1);
  });

  it("boundary: item exactly 7 days ago is included in thisWeek", () => {
    const weekAgo = new Date(NOW - 7 * 86_400_000).toISOString().slice(0, 10);
    const items = [makeItem({ id: "1", pub_date: weekAgo + "T00:00:00Z" })];
    expect(computeJobStats(items, NOW).thisWeek).toBe(1);
  });

  it("boundary: item 8 days ago is excluded from thisWeek", () => {
    const eightDaysAgo = new Date(NOW - 8 * 86_400_000).toISOString().slice(0, 10);
    const items = [makeItem({ id: "1", pub_date: eightDaysAgo + "T00:00:00Z" })];
    expect(computeJobStats(items, NOW).thisWeek).toBe(0);
  });

  it("boundary: item exactly 14 days ago is included in active", () => {
    const twoWeeksAgo = new Date(NOW - 14 * 86_400_000).toISOString().slice(0, 10);
    const items = [makeItem({ id: "1", pub_date: twoWeeksAgo + "T00:00:00Z" })];
    expect(computeJobStats(items, NOW).active).toBe(1);
  });

  it("boundary: item 15 days ago is excluded from active", () => {
    const fifteenDaysAgo = new Date(NOW - 15 * 86_400_000).toISOString().slice(0, 10);
    const items = [makeItem({ id: "1", pub_date: fifteenDaysAgo + "T00:00:00Z" })];
    expect(computeJobStats(items, NOW).active).toBe(0);
  });

  it("thisWeek items are also counted in active", () => {
    const items = [makeItem({ id: "1", pub_date: "2026-05-14T10:00:00Z" })];
    const stats = computeJobStats(items, NOW);
    expect(stats.thisWeek).toBe(1);
    expect(stats.active).toBe(1);
  });

  it("handles date-only pub_date strings", () => {
    const items = [makeItem({ id: "1", pub_date: "2026-05-14" })];
    const stats = computeJobStats(items, NOW);
    expect(stats.thisWeek).toBe(1);
    expect(stats.active).toBe(1);
  });

  it("handles items with all null fields", () => {
    const items = [makeItem({ id: "1", pub_date: null, source: null, snippet: null })];
    const stats = computeJobStats(items, NOW);
    expect(stats.total).toBe(1);
    expect(stats.thisWeek).toBe(0);
    expect(stats.active).toBe(0);
    expect(stats.sourceCount).toBe(0);
  });
});
