import { describe, it, expect } from "vitest";
import {
  getMonthDays,
  getWeekRows,
  getEventSegmentsForWeek,
  getCategoryCalendarColor,
  getTierMarker,
  formatMonthKey,
  parseMonthKey,
  navigateMonth,
} from "../calendar-utils";
import type { Conference } from "../types";

function makeConf(overrides: Partial<Conference> = {}): Conference {
  return {
    id: "1",
    name: "Test Conf",
    abbreviation: null,
    url: null,
    location: null,
    start_date: "2026-05-10",
    end_date: "2026-05-12",
    category: "network-systems",
    tier: "top",
    topics: [],
    notes: null,
    created_at: "2026-01-01",
    ...overrides,
  };
}

describe("getMonthDays", () => {
  it("returns correct number of days for May 2026 (31 days)", () => {
    const days = getMonthDays(2026, 5);
    const inMonth = days.filter((d) => d.inMonth);
    expect(inMonth).toHaveLength(31);
  });

  it("returns days divisible by 7 (complete weeks)", () => {
    const days = getMonthDays(2026, 5);
    expect(days.length % 7).toBe(0);
  });

  it("first in-month day has day=1", () => {
    const days = getMonthDays(2026, 2);
    const first = days.find((d) => d.inMonth);
    expect(first?.day).toBe(1);
  });

  it("handles February in leap year (2024)", () => {
    const days = getMonthDays(2024, 2);
    const inMonth = days.filter((d) => d.inMonth);
    expect(inMonth).toHaveLength(29);
  });

  it("handles February in non-leap year (2025)", () => {
    const days = getMonthDays(2025, 2);
    const inMonth = days.filter((d) => d.inMonth);
    expect(inMonth).toHaveLength(28);
  });

  it("pads preceding days from previous month", () => {
    const days = getMonthDays(2026, 5);
    const firstInMonth = days.findIndex((d) => d.inMonth);
    if (firstInMonth > 0) {
      expect(days[0].inMonth).toBe(false);
    }
  });
});

describe("getWeekRows", () => {
  it("splits days into rows of 7", () => {
    const days = getMonthDays(2026, 5);
    const rows = getWeekRows(days);
    for (const row of rows) {
      expect(row).toHaveLength(7);
    }
  });

  it("returns 4-6 rows for any month", () => {
    const rows = getWeekRows(getMonthDays(2026, 5));
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(rows.length).toBeLessThanOrEqual(6);
  });
});

describe("getEventSegmentsForWeek", () => {
  it("places a single-day event", () => {
    const conf = makeConf({ start_date: "2026-05-11", end_date: "2026-05-11" });
    const weekDates = ["2026-05-10", "2026-05-11", "2026-05-12", "2026-05-13", "2026-05-14", "2026-05-15", "2026-05-16"];
    const rows = getEventSegmentsForWeek([conf], weekDates);
    expect(rows).toHaveLength(1);
    expect(rows[0][0].startCol).toBe(1);
    expect(rows[0][0].span).toBe(1);
  });

  it("places a multi-day event spanning the week", () => {
    const conf = makeConf({ start_date: "2026-05-10", end_date: "2026-05-14" });
    const weekDates = ["2026-05-10", "2026-05-11", "2026-05-12", "2026-05-13", "2026-05-14", "2026-05-15", "2026-05-16"];
    const rows = getEventSegmentsForWeek([conf], weekDates);
    expect(rows[0][0].startCol).toBe(0);
    expect(rows[0][0].span).toBe(5);
  });

  it("returns empty for events outside the week", () => {
    const conf = makeConf({ start_date: "2026-06-01", end_date: "2026-06-03" });
    const weekDates = ["2026-05-10", "2026-05-11", "2026-05-12", "2026-05-13", "2026-05-14", "2026-05-15", "2026-05-16"];
    const rows = getEventSegmentsForWeek([conf], weekDates);
    expect(rows).toHaveLength(0);
  });

  it("stacks overlapping events into separate rows", () => {
    const c1 = makeConf({ id: "1", start_date: "2026-05-10", end_date: "2026-05-13" });
    const c2 = makeConf({ id: "2", start_date: "2026-05-11", end_date: "2026-05-14" });
    const weekDates = ["2026-05-10", "2026-05-11", "2026-05-12", "2026-05-13", "2026-05-14", "2026-05-15", "2026-05-16"];
    const rows = getEventSegmentsForWeek([c1, c2], weekDates);
    expect(rows).toHaveLength(2);
  });

  it("places non-overlapping events in the same row", () => {
    const c1 = makeConf({ id: "1", start_date: "2026-05-10", end_date: "2026-05-11" });
    const c2 = makeConf({ id: "2", start_date: "2026-05-14", end_date: "2026-05-15" });
    const weekDates = ["2026-05-10", "2026-05-11", "2026-05-12", "2026-05-13", "2026-05-14", "2026-05-15", "2026-05-16"];
    const rows = getEventSegmentsForWeek([c1, c2], weekDates);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveLength(2);
  });

  it("handles event with no end_date as single-day", () => {
    const conf = makeConf({ start_date: "2026-05-12", end_date: null });
    const weekDates = ["2026-05-10", "2026-05-11", "2026-05-12", "2026-05-13", "2026-05-14", "2026-05-15", "2026-05-16"];
    const rows = getEventSegmentsForWeek([conf], weekDates);
    expect(rows[0][0].span).toBe(1);
  });

  it("clips events that extend beyond the week", () => {
    const conf = makeConf({ start_date: "2026-05-08", end_date: "2026-05-18" });
    const weekDates = ["2026-05-10", "2026-05-11", "2026-05-12", "2026-05-13", "2026-05-14", "2026-05-15", "2026-05-16"];
    const rows = getEventSegmentsForWeek([conf], weekDates);
    expect(rows[0][0].startCol).toBe(0);
    expect(rows[0][0].span).toBe(7);
    expect(rows[0][0].isStart).toBe(false);
    expect(rows[0][0].isEnd).toBe(false);
  });
});

describe("getCategoryCalendarColor", () => {
  it("returns colors for all categories", () => {
    const categories = ["network-systems", "measurement", "security", "emerging", "infrastructure"] as const;
    for (const cat of categories) {
      const result = getCategoryCalendarColor(cat);
      expect(result.bg).toBeTruthy();
      expect(result.text).toBeTruthy();
      expect(result.border).toBeTruthy();
    }
  });
});

describe("getTierMarker", () => {
  it("returns filled circle for top", () => {
    expect(getTierMarker("top")).toBe("●");
  });
  it("returns empty circle for good", () => {
    expect(getTierMarker("good")).toBe("○");
  });
  it("returns dot for workshop", () => {
    expect(getTierMarker("workshop")).toBe("·");
  });
});

describe("formatMonthKey", () => {
  it("formats year and month with zero padding", () => {
    expect(formatMonthKey(2026, 5)).toBe("2026-05");
    expect(formatMonthKey(2026, 12)).toBe("2026-12");
  });
});

describe("parseMonthKey", () => {
  it("parses YYYY-MM string", () => {
    expect(parseMonthKey("2026-05")).toEqual({ year: 2026, month: 5 });
    expect(parseMonthKey("2025-12")).toEqual({ year: 2025, month: 12 });
  });
});

describe("navigateMonth", () => {
  it("moves forward one month", () => {
    expect(navigateMonth(2026, 5, 1)).toEqual({ year: 2026, month: 6 });
  });

  it("moves backward one month", () => {
    expect(navigateMonth(2026, 5, -1)).toEqual({ year: 2026, month: 4 });
  });

  it("wraps year forward", () => {
    expect(navigateMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  });

  it("wraps year backward", () => {
    expect(navigateMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });
});
