import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  monthKey,
  quarterKey,
  countByField,
  countArrayField,
  monthlyTrend,
} from "../insights";

describe("monthKey", () => {
  it("extracts YYYY-MM from date string", () => {
    expect(monthKey("2025-03-15")).toBe("2025-03");
    expect(monthKey("2024-12-01")).toBe("2024-12");
  });
});

describe("quarterKey", () => {
  it("maps months 1-3 to Q1", () => {
    expect(quarterKey("2025-01-10")).toBe("2025 Q1");
    expect(quarterKey("2025-03-31")).toBe("2025 Q1");
  });

  it("maps months 4-6 to Q2", () => {
    expect(quarterKey("2025-04-01")).toBe("2025 Q2");
    expect(quarterKey("2025-06-30")).toBe("2025 Q2");
  });

  it("maps months 7-9 to Q3", () => {
    expect(quarterKey("2025-07-01")).toBe("2025 Q3");
    expect(quarterKey("2025-09-15")).toBe("2025 Q3");
  });

  it("maps months 10-12 to Q4", () => {
    expect(quarterKey("2025-10-01")).toBe("2025 Q4");
    expect(quarterKey("2025-12-31")).toBe("2025 Q4");
  });
});

describe("countByField", () => {
  const rows = [
    { tier: "top" },
    { tier: "top" },
    { tier: "good" },
    { tier: "top" },
    { tier: null },
  ];

  it("counts occurrences and sorts descending", () => {
    const result = countByField(rows as Record<string, unknown>[], "tier");
    expect(result).toEqual([
      { name: "top", value: 3 },
      { name: "good", value: 1 },
    ]);
  });

  it("respects limit", () => {
    const result = countByField(rows as Record<string, unknown>[], "tier", 1);
    expect(result).toEqual([{ name: "top", value: 3 }]);
  });

  it("returns empty for empty input", () => {
    expect(countByField([], "tier")).toEqual([]);
  });

  it("skips null/undefined values", () => {
    const data = [{ x: null }, { x: undefined }, { x: "a" }];
    const result = countByField(data as Record<string, unknown>[], "x");
    expect(result).toEqual([{ name: "a", value: 1 }]);
  });
});

describe("countArrayField", () => {
  const rows = [
    { topics: ["sdn", "p4"] },
    { topics: ["sdn", "ebpf"] },
    { topics: null },
    { topics: ["p4"] },
  ];

  it("counts items across arrays and sorts descending", () => {
    const result = countArrayField(rows as Record<string, unknown>[], "topics");
    expect(result).toEqual([
      { name: "sdn", value: 2 },
      { name: "p4", value: 2 },
      { name: "ebpf", value: 1 },
    ]);
  });

  it("respects limit", () => {
    const result = countArrayField(rows as Record<string, unknown>[], "topics", 2);
    expect(result).toHaveLength(2);
  });

  it("returns empty for empty input", () => {
    expect(countArrayField([], "topics")).toEqual([]);
  });

  it("handles rows with non-array field", () => {
    const data = [{ topics: "not-array" }, { topics: ["a"] }];
    const result = countArrayField(data as Record<string, unknown>[], "topics");
    expect(result).toEqual([{ name: "a", value: 1 }]);
  });
});

describe("monthlyTrend", () => {
  it("returns correct number of months", () => {
    const result = monthlyTrend([], 6);
    expect(result).toHaveLength(6);
  });

  it("counts rows into correct month buckets", () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const rows = [
      { date: `${currentMonth}-05` },
      { date: `${currentMonth}-15` },
      { date: `${currentMonth}-25` },
    ];
    const result = monthlyTrend(rows, 3);
    const last = result[result.length - 1];
    expect(last.name).toBe(currentMonth);
    expect(last.value).toBe(3);
  });

  it("ignores rows outside the window", () => {
    const rows = [{ date: "1990-01-01" }];
    const result = monthlyTrend(rows, 3);
    expect(result.every((p) => p.value === 0)).toBe(true);
  });

  it("initializes all months to zero", () => {
    const result = monthlyTrend([], 12);
    expect(result.every((p) => p.value === 0)).toBe(true);
    expect(result).toHaveLength(12);
  });
});
