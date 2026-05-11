import { describe, it, expect, vi, afterEach } from "vitest";
import { getFreshness, freshnessLabel } from "../freshness";

describe("getFreshness", () => {
  afterEach(() => { vi.useRealTimers(); });

  it("returns fresh for < 1 hour", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-11T20:30:00Z"));
    const result = getFreshness("2026-05-11T20:00:00Z");
    expect(result.level).toBe("fresh");
    expect(result.dotClass).toContain("emerald");
  });

  it("returns recent for 1-6 hours", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-11T22:00:00Z"));
    const result = getFreshness("2026-05-11T19:00:00Z");
    expect(result.level).toBe("recent");
    expect(result.dotClass).toContain("yellow");
  });

  it("returns stale for 6-24 hours", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-12T06:00:00Z"));
    const result = getFreshness("2026-05-11T20:00:00Z");
    expect(result.level).toBe("stale");
    expect(result.dotClass).toContain("orange");
  });

  it("returns expired for > 24 hours", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T00:00:00Z"));
    const result = getFreshness("2026-05-11T20:00:00Z");
    expect(result.level).toBe("expired");
    expect(result.dotClass).toContain("red");
  });

  it("returns expired for null input", () => {
    const result = getFreshness(null);
    expect(result.level).toBe("expired");
  });
});

describe("freshnessLabel", () => {
  it("returns English label", () => {
    expect(freshnessLabel("fresh", "en")).toBe("Just synced");
    expect(freshnessLabel("expired", "en")).toBe("May be stale");
  });

  it("returns Chinese label", () => {
    expect(freshnessLabel("fresh", "zh")).toBe("刚刚同步");
    expect(freshnessLabel("stale", "zh")).toBe("建议刷新");
  });
});
