import { describe, it, expect, vi, afterEach } from "vitest";
import { relativeTime, conferenceStatus, formatDateRange, isExpired, isCurrentYear } from "../format";

describe("relativeTime", () => {
  afterEach(() => { vi.useRealTimers(); });

  it("returns 'just now' for recent timestamps", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11T12:00:00Z") });
    expect(relativeTime("2026-05-11T11:59:50Z")).toBe("just now");
  });

  it("returns minutes ago", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11T12:00:00Z") });
    expect(relativeTime("2026-05-11T11:45:00Z")).toBe("15m ago");
  });

  it("returns hours ago", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11T12:00:00Z") });
    expect(relativeTime("2026-05-11T09:00:00Z")).toBe("3h ago");
  });

  it("returns days ago", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11T12:00:00Z") });
    expect(relativeTime("2026-05-06T12:00:00Z")).toBe("5d ago");
  });

  it("returns months ago", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11T12:00:00Z") });
    expect(relativeTime("2026-02-11T12:00:00Z")).toBe("2mo ago");
  });

  it("returns years ago", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11T12:00:00Z") });
    expect(relativeTime("2024-05-11T12:00:00Z")).toBe("2y ago");
  });

  it("returns Chinese for zh lang", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11T12:00:00Z") });
    expect(relativeTime("2026-05-11T09:00:00Z", "zh")).toBe("3小时前");
  });

  it("returns 'just now' for future dates", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11T12:00:00Z") });
    expect(relativeTime("2026-05-12T12:00:00Z")).toBe("just now");
  });
});

describe("conferenceStatus", () => {
  afterEach(() => { vi.useRealTimers(); });

  it("returns past for ended conferences", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11") });
    const s = conferenceStatus("2026-05-01", "2026-05-05");
    expect(s.variant).toBe("past");
    expect(s.label).toBe("Past");
  });

  it("returns ongoing for current conferences", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11") });
    const s = conferenceStatus("2026-05-10", "2026-05-15");
    expect(s.variant).toBe("ongoing");
    expect(s.label).toBe("Ongoing");
  });

  it("returns upcoming with days count", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11") });
    const s = conferenceStatus("2026-05-21", "2026-05-25");
    expect(s.variant).toBe("upcoming");
    expect(s.label).toBe("in 10d");
  });

  it("handles null end_date as single-day conference", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11") });
    const past = conferenceStatus("2026-05-10", null);
    expect(past.variant).toBe("past");
  });

  it("returns Chinese labels for zh", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11") });
    const s = conferenceStatus("2026-05-10", "2026-05-15", "zh");
    expect(s.label).toBe("进行中");
  });
});

describe("formatDateRange", () => {
  it("formats single date without end_date", () => {
    expect(formatDateRange("2026-05-11", null)).toBe("May 11");
  });

  it("formats same-month range", () => {
    expect(formatDateRange("2026-05-12", "2026-05-15")).toBe("May 12–15");
  });

  it("formats cross-month range", () => {
    expect(formatDateRange("2026-05-28", "2026-06-02")).toBe("May 28 – Jun 2");
  });
});

describe("isExpired", () => {
  afterEach(() => { vi.useRealTimers(); });

  it("returns false for null/undefined", () => {
    expect(isExpired(null)).toBe(false);
    expect(isExpired(undefined)).toBe(false);
  });

  it("returns true for dates older than threshold", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11T12:00:00Z") });
    expect(isExpired("2026-04-01T00:00:00Z", 30)).toBe(true);
  });

  it("returns false for recent dates", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11T12:00:00Z") });
    expect(isExpired("2026-05-01T00:00:00Z", 30)).toBe(false);
  });
});

describe("isCurrentYear", () => {
  afterEach(() => { vi.useRealTimers(); });

  it("returns true for current year", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11") });
    expect(isCurrentYear("2026-03-15")).toBe(true);
  });

  it("returns false for past year", () => {
    vi.useFakeTimers({ now: new Date("2026-05-11") });
    expect(isCurrentYear("2025-12-01")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isCurrentYear(null)).toBe(false);
  });
});
