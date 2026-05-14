import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAllNetworkPapers, parseArxivXml, parseS2Papers, mergeResults, normalizeTitle } from "../paper-import";
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
    vi.stubGlobal("process", { ...process, env: {} });
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
    vi.stubGlobal("process", { ...process, env: {} });
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
    vi.stubGlobal("process", { ...process, env: {} });
    mockFetch(async () => ({ ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) } as Response));

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await advanceTimers();
    const result: PaperFetchResult = await promise;

    expect(result.papers.length).toBeGreaterThan(0);
    expect(result.papers[0].title).toBe("A Novel Approach to Network Optimization");
    expect(result.papers[0].authors).toEqual(["Alice Smith", "Bob Jones"]);
    expect(result.papers[0].topics).toContain("cs.NI");
    expect(result.papers[0].source).toBe("arxiv");

    const arxivStats = result.categoryStats.filter((s) => s.category.startsWith("cs."));
    expect(arxivStats).toHaveLength(6);
    for (const stat of arxivStats) {
      expect(stat.status).toBe("ok");
    }
  });

  it("records per-category error on HTTP failure", async () => {
    vi.stubGlobal("process", { ...process, env: {} });
    let callIdx = 0;
    mockFetch(async () => {
      callIdx++;
      if (callIdx === 1) return { ok: false, status: 503 } as Response;
      return { ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) } as Response;
    });

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await advanceTimers();
    const result = await promise;

    const arxivStats = result.categoryStats.filter((s) => s.category.startsWith("cs."));
    const failed = arxivStats.filter((s) => s.status === "error");
    expect(failed).toHaveLength(1);
    expect(failed[0].category).toBe("cs.NI");
    expect(failed[0].error).toBe("HTTP 503");
  });

  it("records per-category error on network failure", async () => {
    vi.stubGlobal("process", { ...process, env: {} });
    let callIdx = 0;
    mockFetch(async () => {
      callIdx++;
      // cs.AI is 2nd category; with retry, calls 2 (first) and 3 (retry) both fail
      if (callIdx === 2 || callIdx === 3) throw new Error("ECONNRESET");
      return { ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) } as Response;
    });

    const promise = fetchAllNetworkPapers(2026);
    // Extra timer advances for retry delay (2s) on the failing category
    for (let i = 0; i < 6; i++) {
      await advanceTimers();
      await vi.advanceTimersByTimeAsync(2000);
    }
    const result = await promise;

    const arxivStats = result.categoryStats.filter((s) => s.category.startsWith("cs."));
    const failed = arxivStats.filter((s) => s.status === "error");
    expect(failed).toHaveLength(1);
    expect(failed[0].category).toBe("cs.AI");
    expect(failed[0].error).toBe("ECONNRESET");
  });

  it("deduplicates papers by title across categories", async () => {
    vi.stubGlobal("process", { ...process, env: {} });
    mockFetch(async () => ({ ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) } as Response));

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await advanceTimers();
    const result = await promise;

    const titles = result.papers.map((p) => p.title);
    const unique = new Set(titles);
    expect(titles.length).toBe(unique.size);
  });

  it("parses published_date as YYYY-MM-DD", async () => {
    vi.stubGlobal("process", { ...process, env: {} });
    mockFetch(async () => ({ ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) } as Response));

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await advanceTimers();
    const result = await promise;

    expect(result.papers[0].published_date).toBe("2026-01-15");
  });

  it("handles all categories failing", async () => {
    vi.stubGlobal("process", { ...process, env: {} });
    mockFetch(async () => { throw new Error("timeout"); });

    const promise = fetchAllNetworkPapers(2026);
    // Each category: fetch fails → 2s retry delay → fetch fails again → 3s inter-category delay
    for (let i = 0; i < 6; i++) {
      await vi.advanceTimersByTimeAsync(2000);
      await advanceTimers();
    }
    const result = await promise;

    expect(result.papers).toHaveLength(0);
    const arxivStats = result.categoryStats.filter((s) => s.category.startsWith("cs."));
    expect(arxivStats).toHaveLength(6);
    for (const stat of arxivStats) {
      expect(stat.status).toBe("error");
    }
  });
});

describe("parseArxivXml", () => {
  it("parses entries with source=arxiv", () => {
    const papers = parseArxivXml(SAMPLE_ARXIV);
    expect(papers).toHaveLength(2);
    expect(papers[0].source).toBe("arxiv");
    expect(papers[1].source).toBe("arxiv");
  });

  it("filters only cs.* categories as topics", () => {
    const xml = `<feed><entry>
      <id>http://arxiv.org/abs/2601.00003v1</id>
      <title>Test</title>
      <summary>Test</summary>
      <published>2026-01-01T00:00:00Z</published>
      <author><name>Test</name></author>
      <category term="cs.NI" />
      <category term="math.OC" />
    </entry></feed>`;
    const papers = parseArxivXml(xml);
    expect(papers[0].topics).toEqual(["cs.NI"]);
  });
});

describe("parseS2Papers", () => {
  const SAMPLE_S2 = [
    {
      title: "Fast Datacenter Networking with RDMA",
      authors: [{ name: "Alice Smith" }, { name: "Bob Jones" }],
      venue: "SIGCOMM",
      year: 2026,
      citationCount: 42,
      url: "https://api.semanticscholar.org/paper/123",
      abstract: "We present a new RDMA-based networking stack.",
      externalIds: { ArXiv: "2601.12345" },
    },
    {
      title: "eBPF for Network Monitoring",
      authors: [{ name: "Charlie Brown" }],
      venue: "SIGCOMM",
      year: 2026,
      citationCount: 0,
      url: "https://api.semanticscholar.org/paper/456",
      abstract: null,
      externalIds: null,
    },
  ];

  it("parses S2 papers with correct fields", () => {
    const papers = parseS2Papers(SAMPLE_S2, "SIGCOMM");
    expect(papers).toHaveLength(2);
    expect(papers[0].title).toBe("Fast Datacenter Networking with RDMA");
    expect(papers[0].authors).toEqual(["Alice Smith", "Bob Jones"]);
    expect(papers[0].venue).toBe("SIGCOMM");
    expect(papers[0].source).toBe("semantic-scholar");
    expect(papers[0].citation_count).toBe(42);
  });

  it("uses arXiv URL when externalIds.ArXiv exists", () => {
    const papers = parseS2Papers(SAMPLE_S2, "SIGCOMM");
    expect(papers[0].url).toBe("https://arxiv.org/abs/2601.12345");
  });

  it("falls back to S2 URL when no ArXiv ID", () => {
    const papers = parseS2Papers(SAMPLE_S2, "SIGCOMM");
    expect(papers[1].url).toBe("https://api.semanticscholar.org/paper/456");
  });

  it("sets published_date from year", () => {
    const papers = parseS2Papers(SAMPLE_S2, "SIGCOMM");
    expect(papers[0].published_date).toBe("2026-01-01");
  });

  it("handles null year", () => {
    const papers = parseS2Papers([{ ...SAMPLE_S2[0], year: null }], "NSDI");
    expect(papers[0].published_date).toBeNull();
  });

  it("handles null abstract", () => {
    const papers = parseS2Papers(SAMPLE_S2, "SIGCOMM");
    expect(papers[1].abstract).toBeNull();
  });

  it("truncates abstract to 2000 chars", () => {
    const longAbstract = "x".repeat(3000);
    const papers = parseS2Papers([{ ...SAMPLE_S2[0], abstract: longAbstract }], "SIGCOMM");
    expect(papers[0].abstract!.length).toBe(2000);
  });
});

describe("normalizeTitle", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalizeTitle("Hello, World!")).toBe("hello world");
  });

  it("collapses whitespace", () => {
    expect(normalizeTitle("  foo   bar  ")).toBe("foo bar");
  });

  it("handles empty string", () => {
    expect(normalizeTitle("")).toBe("");
  });
});

describe("mergeResults", () => {
  const arxivResult: PaperFetchResult = {
    papers: [
      { title: "Paper A", authors: ["Auth1"], venue: "arXiv", url: null, published_date: "2026-01-01", abstract: null, topics: ["cs.NI"], source: "arxiv" },
      { title: "Paper B", authors: ["Auth2"], venue: "arXiv", url: null, published_date: "2026-02-01", abstract: null, topics: ["cs.AI"], source: "arxiv" },
    ],
    categoryStats: [{ category: "cs.NI", status: "ok", count: 2 }],
  };

  const s2Result: PaperFetchResult = {
    papers: [
      { title: "Paper A", authors: ["Auth1"], venue: "SIGCOMM", url: null, published_date: "2026-01-01", abstract: null, topics: [], citation_count: 10, source: "semantic-scholar" },
      { title: "Paper C", authors: ["Auth3"], venue: "NSDI", url: null, published_date: "2026-03-01", abstract: null, topics: [], citation_count: 5, source: "semantic-scholar" },
    ],
    categoryStats: [{ category: "SIGCOMM", status: "ok", count: 1 }],
  };

  it("deduplicates by normalized title", () => {
    const merged = mergeResults(arxivResult, s2Result);
    expect(merged.papers).toHaveLength(3);
  });

  it("keeps arxiv version for duplicates", () => {
    const merged = mergeResults(arxivResult, s2Result);
    const paperA = merged.papers.find((p) => p.title === "Paper A")!;
    expect(paperA.source).toBe("arxiv");
    expect(paperA.venue).toBe("arXiv");
  });

  it("enriches arxiv paper with S2 citation_count", () => {
    const merged = mergeResults(arxivResult, s2Result);
    const paperA = merged.papers.find((p) => p.title === "Paper A")!;
    expect(paperA.citation_count).toBe(10);
  });

  it("adds S2-only papers", () => {
    const merged = mergeResults(arxivResult, s2Result);
    const paperC = merged.papers.find((p) => p.title === "Paper C")!;
    expect(paperC.source).toBe("semantic-scholar");
    expect(paperC.citation_count).toBe(5);
  });

  it("merges categoryStats from both sources", () => {
    const merged = mergeResults(arxivResult, s2Result);
    expect(merged.categoryStats).toHaveLength(2);
    expect(merged.categoryStats[0].category).toBe("cs.NI");
    expect(merged.categoryStats[1].category).toBe("SIGCOMM");
  });

  it("handles case-insensitive title matching", () => {
    const arxiv: PaperFetchResult = {
      papers: [{ title: "PAPER A", authors: [], venue: "arXiv", url: null, published_date: null, abstract: null, topics: [], source: "arxiv" }],
      categoryStats: [],
    };
    const s2: PaperFetchResult = {
      papers: [{ title: "paper a", authors: [], venue: "SIGCOMM", url: null, published_date: null, abstract: null, topics: [], citation_count: 7, source: "semantic-scholar" }],
      categoryStats: [],
    };
    const merged = mergeResults(arxiv, s2);
    expect(merged.papers).toHaveLength(1);
    expect(merged.papers[0].citation_count).toBe(7);
  });

  it("handles empty S2 result", () => {
    const empty: PaperFetchResult = { papers: [], categoryStats: [] };
    const merged = mergeResults(arxivResult, empty);
    expect(merged.papers).toHaveLength(2);
  });
});

describe("fetchAllNetworkPapers - S2 degradation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  it("skips S2 when no API key is set", async () => {
    vi.stubGlobal("process", { ...process, env: {} });
    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string) => {
      urls.push(url);
      return { ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) } as Response;
    }));

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 6; i++) await vi.advanceTimersByTimeAsync(3000);
    const result = await promise;

    expect(urls.every((u) => u.includes("arxiv.org"))).toBe(true);
    const s2Stat = result.categoryStats.find((s) => s.category === "semantic-scholar");
    expect(s2Stat).toBeDefined();
    expect(s2Stat!.status).toBe("skipped");
    expect(s2Stat!.error).toBe("SEMANTIC_SCHOLAR_API_KEY not configured");
  });

  it("fetches from S2 when API key is present", async () => {
    vi.stubGlobal("process", { ...process, env: { SEMANTIC_SCHOLAR_API_KEY: "test-key" } });
    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string) => {
      urls.push(url);
      if (url.includes("semanticscholar.org")) {
        return { ok: true, json: () => Promise.resolve({ data: [] }) } as unknown as Response;
      }
      return { ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) } as Response;
    }));

    const promise = fetchAllNetworkPapers(2026);
    for (let i = 0; i < 12; i++) await vi.advanceTimersByTimeAsync(3000);
    const result = await promise;

    expect(urls.some((u) => u.includes("semanticscholar.org"))).toBe(true);
    const s2Stats = result.categoryStats.filter((s) => !s.category.startsWith("cs.") && s.category !== "semantic-scholar");
    expect(s2Stats.length).toBeGreaterThan(0);
  });
});
