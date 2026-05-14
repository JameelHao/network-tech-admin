import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchSingleArxivCategory,
  fetchSingleS2Venue,
  ARXIV_CATEGORIES,
  S2_VENUES,
  parseArxivXml,
} from "../paper-import";

const SAMPLE_ARXIV = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2601.00001v1</id>
    <title>Step Test Paper</title>
    <summary>Abstract text.</summary>
    <published>2026-03-15T00:00:00Z</published>
    <author><name>Alice</name></author>
    <category term="cs.NI" />
  </entry>
</feed>`;

describe("ARXIV_CATEGORIES constant", () => {
  it("has 6 categories", () => {
    expect(ARXIV_CATEGORIES).toHaveLength(6);
  });

  it("all start with cs.", () => {
    for (const cat of ARXIV_CATEGORIES) {
      expect(cat).toMatch(/^cs\./);
    }
  });

  it("includes cs.NI", () => {
    expect(ARXIV_CATEGORIES).toContain("cs.NI");
  });
});

describe("S2_VENUES constant", () => {
  it("has 6 venues", () => {
    expect(S2_VENUES).toHaveLength(6);
  });

  it("includes SIGCOMM", () => {
    expect(S2_VENUES).toContain("SIGCOMM");
  });

  it("includes all expected venues", () => {
    for (const v of ["SIGCOMM", "NSDI", "IMC", "OSDI", "SOSP", "CoNEXT"]) {
      expect(S2_VENUES).toContain(v);
    }
  });
});

describe("fetchSingleArxivCategory", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns papers for a single category", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SAMPLE_ARXIV),
    }));

    const result = await fetchSingleArxivCategory("cs.NI", 2026);
    expect(result.papers).toHaveLength(1);
    expect(result.papers[0].title).toBe("Step Test Paper");
    expect(result.categoryStats).toHaveLength(1);
    expect(result.categoryStats[0].category).toBe("cs.NI");
    expect(result.categoryStats[0].status).toBe("ok");
  });

  it("returns error stat on HTTP failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const result = await fetchSingleArxivCategory("cs.AI", 2026);
    expect(result.papers).toHaveLength(0);
    expect(result.categoryStats[0].status).toBe("error");
    expect(result.categoryStats[0].error).toBe("HTTP 503");
  });

  it("returns error stat on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNRESET")));

    const result = await fetchSingleArxivCategory("cs.DC", 2026);
    expect(result.papers).toHaveLength(0);
    expect(result.categoryStats[0].status).toBe("error");
    expect(result.categoryStats[0].error).toBe("ECONNRESET");
  });

  it("uses correct URL format", async () => {
    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string) => {
      urls.push(url);
      return { ok: true, text: () => Promise.resolve(SAMPLE_ARXIV) };
    }));

    await fetchSingleArxivCategory("cs.PF", 2026);
    expect(urls[0]).toContain("cat:cs.PF");
    expect(urls[0]).toContain("202601010000");
    expect(urls[0]).toMatch(/^https:\/\/export\.arxiv\.org/);
  });

  it("passes redirect: follow", async () => {
    const spy = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SAMPLE_ARXIV),
    });
    vi.stubGlobal("fetch", spy);

    await fetchSingleArxivCategory("cs.NI", 2026);
    expect(spy.mock.calls[0][1]).toEqual(expect.objectContaining({ redirect: "follow" }));
  });
});

describe("fetchSingleS2Venue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns skipped when no API key", async () => {
    vi.stubGlobal("process", { ...process, env: {} });

    const result = await fetchSingleS2Venue("SIGCOMM", 2026);
    expect(result.papers).toHaveLength(0);
    expect(result.categoryStats[0].status).toBe("skipped");
    expect(result.categoryStats[0].error).toBe("SEMANTIC_SCHOLAR_API_KEY not configured");
    expect(result.categoryStats[0].category).toBe("SIGCOMM");
  });

  it("returns papers on success", async () => {
    vi.stubGlobal("process", { ...process, env: { SEMANTIC_SCHOLAR_API_KEY: "test-key" } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [{
          title: "S2 Paper",
          authors: [{ name: "Bob" }],
          venue: "SIGCOMM",
          year: 2026,
          citationCount: 5,
          url: "https://example.com",
          abstract: "test",
          externalIds: null,
        }],
      }),
    }));

    const result = await fetchSingleS2Venue("SIGCOMM", 2026);
    expect(result.papers).toHaveLength(1);
    expect(result.papers[0].title).toBe("S2 Paper");
    expect(result.categoryStats[0].status).toBe("ok");
    expect(result.categoryStats[0].count).toBe(1);
  });

  it("returns error stat on HTTP failure", async () => {
    vi.stubGlobal("process", { ...process, env: { SEMANTIC_SCHOLAR_API_KEY: "test-key" } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    const result = await fetchSingleS2Venue("NSDI", 2026);
    expect(result.papers).toHaveLength(0);
    expect(result.categoryStats[0].status).toBe("error");
    expect(result.categoryStats[0].error).toBe("HTTP 429");
  });

  it("returns error stat on network failure", async () => {
    vi.stubGlobal("process", { ...process, env: { SEMANTIC_SCHOLAR_API_KEY: "test-key" } });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));

    const result = await fetchSingleS2Venue("IMC", 2026);
    expect(result.papers).toHaveLength(0);
    expect(result.categoryStats[0].status).toBe("error");
    expect(result.categoryStats[0].error).toBe("timeout");
  });

  it("sends x-api-key header", async () => {
    vi.stubGlobal("process", { ...process, env: { SEMANTIC_SCHOLAR_API_KEY: "my-key" } });
    const spy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal("fetch", spy);

    await fetchSingleS2Venue("OSDI", 2026);
    expect(spy.mock.calls[0][1].headers).toEqual(expect.objectContaining({ "x-api-key": "my-key" }));
  });

  it("uses correct URL with venue param", async () => {
    vi.stubGlobal("process", { ...process, env: { SEMANTIC_SCHOLAR_API_KEY: "k" } });
    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string) => {
      urls.push(url);
      return { ok: true, json: () => Promise.resolve({ data: [] }) };
    }));

    await fetchSingleS2Venue("CoNEXT", 2026);
    expect(urls[0]).toContain("venue=CoNEXT");
    expect(urls[0]).toContain("year=2026");
    expect(urls[0]).toMatch(/^https:\/\/api\.semanticscholar\.org/);
  });
});

describe("step list completeness", () => {
  it("total steps = ARXIV_CATEGORIES + S2_VENUES = 12", () => {
    expect(ARXIV_CATEGORIES.length + S2_VENUES.length).toBe(12);
  });

  it("no duplicate keys across sources", () => {
    const allKeys = [...ARXIV_CATEGORIES, ...S2_VENUES];
    expect(new Set(allKeys).size).toBe(allKeys.length);
  });
});
