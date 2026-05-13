import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAllNetworkPapers } from "../paper-import";
import type { PaperFetchResult } from "../paper-import";

const SAMPLE_ARXIV = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2601.00001v1</id>
    <title>A Novel Approach to Network Optimization</title>
    <summary>This paper presents a new method for optimizing network performance.</summary>
    <published>2026-01-15T00:00:00Z</published>
    <author><name>Alice Smith</name></author>
    <author><name>Bob Jones</name></author>
    <category term="cs.NI" />
    <category term="cs.AI" />
  </entry>
  <entry>
    <id>http://arxiv.org/abs/2601.00002v1</id>
    <title>Deep Learning for BGP Analysis</title>
    <summary>We apply deep learning to BGP routing data.</summary>
    <published>2026-01-10T00:00:00Z</published>
    <author><name>Charlie Brown</name></author>
    <category term="cs.NI" />
  </entry>
</feed>`;

describe("paper-import module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  function mockFetch(impl: (url: string) => Promise<Response>) {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(impl));
  }

  function advanceTimers() {
    return vi.advanceTimersByTimeAsync(3000);
  }

  it("uses HTTPS URLs for arXiv API", async () => {
    const urls: string[] = [];
    mockFetch(async (url: string) => {
      urls.push(url);
      return { ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) } as Response;
    });

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await advanceTimers();
    await promise;

    for (const u of urls) {
      expect(u).toMatch(/^https:\/\/export\.arxiv\.org/);
    }
  });

  it("passes redirect: follow to fetch", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SAMPLE_ARXIV),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await advanceTimers();
    await promise;

    for (const call of fetchSpy.mock.calls) {
      expect(call[1]).toEqual(expect.objectContaining({ redirect: "follow" }));
    }
  });

  it("returns papers and categoryStats on success", async () => {
    mockFetch(async () => ({ ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) } as Response));

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await advanceTimers();
    const result: PaperFetchResult = await promise;

    expect(result.papers.length).toBeGreaterThan(0);
    expect(result.papers[0].title).toBe("A Novel Approach to Network Optimization");
    expect(result.papers[0].authors).toEqual(["Alice Smith", "Bob Jones"]);
    expect(result.papers[0].topics).toContain("cs.NI");

    expect(result.categoryStats).toHaveLength(6);
    for (const stat of result.categoryStats) {
      expect(stat.status).toBe("ok");
    }
  });

  it("records per-category error on HTTP failure", async () => {
    let callIdx = 0;
    mockFetch(async () => {
      callIdx++;
      if (callIdx === 1) return { ok: false, status: 503 } as Response;
      return { ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) } as Response;
    });

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await advanceTimers();
    const result = await promise;

    const failed = result.categoryStats.filter((s) => s.status === "error");
    expect(failed).toHaveLength(1);
    expect(failed[0].category).toBe("cs.NI");
    expect(failed[0].error).toBe("HTTP 503");

    const ok = result.categoryStats.filter((s) => s.status === "ok");
    expect(ok.length).toBe(5);
  });

  it("records per-category error on network failure", async () => {
    let callIdx = 0;
    mockFetch(async () => {
      callIdx++;
      if (callIdx === 2) throw new Error("ECONNRESET");
      return { ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) } as Response;
    });

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await advanceTimers();
    const result = await promise;

    const failed = result.categoryStats.filter((s) => s.status === "error");
    expect(failed).toHaveLength(1);
    expect(failed[0].category).toBe("cs.AI");
    expect(failed[0].error).toBe("ECONNRESET");
  });

  it("deduplicates papers by title across categories", async () => {
    mockFetch(async () => ({ ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) } as Response));

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await advanceTimers();
    const result = await promise;

    const titles = result.papers.map((p) => p.title);
    const unique = new Set(titles);
    expect(titles.length).toBe(unique.size);
  });

  it("parses published_date as YYYY-MM-DD", async () => {
    mockFetch(async () => ({ ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) } as Response));

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await advanceTimers();
    const result = await promise;

    expect(result.papers[0].published_date).toBe("2026-01-15");
  });

  it("handles all categories failing", async () => {
    mockFetch(async () => { throw new Error("timeout"); });

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await advanceTimers();
    const result = await promise;

    expect(result.papers).toHaveLength(0);
    expect(result.categoryStats).toHaveLength(6);
    for (const stat of result.categoryStats) {
      expect(stat.status).toBe("error");
    }
  });
});
