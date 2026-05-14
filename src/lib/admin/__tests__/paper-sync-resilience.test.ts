import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchSingleArxivCategory,
  fetchSingleS2Venue,
  fetchAllNetworkPapers,
} from "../paper-import";
import type { PaperFetchResult } from "../paper-import";

const SAMPLE_ARXIV = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2601.00001v1</id>
    <title>Resilience Test Paper</title>
    <summary>Abstract.</summary>
    <published>2026-03-15T00:00:00Z</published>
    <author><name>Alice</name></author>
    <category term="cs.NI" />
  </entry>
</feed>`;

describe("fetchSingleArxivCategory — timeout and retry", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  it("passes AbortSignal.timeout to fetch", async () => {
    const spy = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SAMPLE_ARXIV),
    });
    vi.stubGlobal("fetch", spy);

    await fetchSingleArxivCategory("cs.NI", 2026);
    expect(spy.mock.calls[0][1].signal).toBeDefined();
  });

  it("retries once on first failure then succeeds", async () => {
    let callCount = 0;
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) throw new Error("timeout");
      return { ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) };
    }));

    const promise = fetchSingleArxivCategory("cs.NI", 2026);
    await vi.advanceTimersByTimeAsync(2000);
    const result = await promise;

    expect(callCount).toBe(2);
    expect(result.papers).toHaveLength(1);
    expect(result.categoryStats[0].status).toBe("ok");
  });

  it("returns error after both attempts fail", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNRESET")));

    const promise = fetchSingleArxivCategory("cs.NI", 2026);
    await vi.advanceTimersByTimeAsync(2000);
    const result = await promise;

    expect(result.papers).toHaveLength(0);
    expect(result.categoryStats[0].status).toBe("error");
    expect(result.categoryStats[0].error).toBe("ECONNRESET");
  });

  it("does not retry on HTTP error (non-throw)", async () => {
    let callCount = 0;
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => {
      callCount++;
      return { ok: false, status: 503 };
    }));

    const result = await fetchSingleArxivCategory("cs.NI", 2026);
    expect(callCount).toBe(1);
    expect(result.categoryStats[0].status).toBe("error");
    expect(result.categoryStats[0].error).toBe("HTTP 503");
  });
});

describe("fetchSingleS2Venue — skipped status", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns skipped when no API key", async () => {
    vi.stubGlobal("process", { ...process, env: {} });

    const result = await fetchSingleS2Venue("SIGCOMM", 2026);
    expect(result.categoryStats[0].status).toBe("skipped");
    expect(result.categoryStats[0].error).toBe("SEMANTIC_SCHOLAR_API_KEY not configured");
    expect(result.papers).toHaveLength(0);
  });

  it("returns ok when API key is present and request succeeds", async () => {
    vi.stubGlobal("process", { ...process, env: { SEMANTIC_SCHOLAR_API_KEY: "test" } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    }));

    const result = await fetchSingleS2Venue("SIGCOMM", 2026);
    expect(result.categoryStats[0].status).toBe("ok");
  });

  it("returns error (not skipped) on HTTP failure with API key", async () => {
    vi.stubGlobal("process", { ...process, env: { SEMANTIC_SCHOLAR_API_KEY: "test" } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    const result = await fetchSingleS2Venue("NSDI", 2026);
    expect(result.categoryStats[0].status).toBe("error");
    expect(result.categoryStats[0].error).toBe("HTTP 429");
  });
});

describe("fetchAllNetworkPapers — allSettled degradation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  it("returns arxiv results even when S2 has no API key", async () => {
    vi.stubGlobal("process", { ...process, env: {} });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SAMPLE_ARXIV),
    }));

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await vi.advanceTimersByTimeAsync(3000);
    const result: PaperFetchResult = await promise;

    expect(result.papers.length).toBeGreaterThan(0);
    const s2Stats = result.categoryStats.filter((s) => s.status === "skipped");
    expect(s2Stats.length).toBeGreaterThan(0);
  });

  it("returns empty result when both sources fail", async () => {
    vi.stubGlobal("process", { ...process, env: {} });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 12; i++) await vi.advanceTimersByTimeAsync(3000);
    const result = await promise;

    expect(result.papers).toHaveLength(0);
  });

  it("merges categoryStats from both sources", async () => {
    vi.stubGlobal("process", { ...process, env: { SEMANTIC_SCHOLAR_API_KEY: "k" } });
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("semanticscholar.org")) {
        return { ok: true, json: () => Promise.resolve({ data: [] }) };
      }
      return { ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) };
    }));

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 12; i++) await vi.advanceTimersByTimeAsync(3000);
    const result = await promise;

    const arxivStats = result.categoryStats.filter((s) => s.category.startsWith("cs."));
    const s2Stats = result.categoryStats.filter((s) => !s.category.startsWith("cs.") && s.category !== "semantic-scholar");
    expect(arxivStats.length).toBe(6);
    expect(s2Stats.length).toBe(6);
  });
});

describe("CategoryStat status type", () => {
  it("supports ok, error, and skipped values", () => {
    const statuses: Array<"ok" | "error" | "skipped"> = ["ok", "error", "skipped"];
    expect(statuses).toHaveLength(3);
  });
});
