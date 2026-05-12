import { describe, it, expect } from "vitest";
import { NEWS_SORTABLE, escapePostgrestValue } from "../news";
import { parsePaginationParams, validateSort } from "../pagination";
import { dict } from "@/lib/i18n/dict";

describe("news table refactor", () => {
  it("NEWS_SORTABLE includes title, source, pub_date", () => {
    expect(NEWS_SORTABLE).toContain("title");
    expect(NEWS_SORTABLE).toContain("source");
    expect(NEWS_SORTABLE).toContain("pub_date");
  });

  it("defaults to page size 25", () => {
    const params = parsePaginationParams({}, { pageSize: 25 });
    expect(params.pageSize).toBe(25);
    expect(params.page).toBe(1);
  });

  it("validates sort against NEWS_SORTABLE", () => {
    const valid = validateSort("title", "asc", NEWS_SORTABLE, "pub_date", "desc");
    expect(valid).toEqual({ column: "title", ascending: true });

    const invalid = validateSort("random_col", "asc", NEWS_SORTABLE, "pub_date", "desc");
    expect(invalid).toEqual({ column: "pub_date", ascending: false });
  });

  it("defaults sort to pub_date DESC", () => {
    const result = validateSort(undefined, undefined, NEWS_SORTABLE, "pub_date", "desc");
    expect(result).toEqual({ column: "pub_date", ascending: false });
  });

  describe("escapePostgrestValue", () => {
    it("strips commas to prevent filter injection", () => {
      expect(escapePostgrestValue("test,id.gt.0")).toBe("testidgt0");
    });

    it("strips parentheses", () => {
      expect(escapePostgrestValue("test(foo)")).toBe("testfoo");
    });

    it("strips curly braces", () => {
      expect(escapePostgrestValue("test{foo}")).toBe("testfoo");
    });

    it("strips dots", () => {
      expect(escapePostgrestValue("id.eq.1")).toBe("ideq1");
    });

    it("strips double quotes and backslashes", () => {
      expect(escapePostgrestValue('test"value\\')).toBe("testvalue");
    });

    it("preserves normal search terms", () => {
      expect(escapePostgrestValue("RDMA network")).toBe("RDMA network");
      expect(escapePostgrestValue("5G")).toBe("5G");
      expect(escapePostgrestValue("eBPF/XDP")).toBe("eBPF/XDP");
    });

    it("handles empty string", () => {
      expect(escapePostgrestValue("")).toBe("");
    });

    it("strips all metacharacters from attack payload", () => {
      expect(escapePostgrestValue('test),venue.eq."arXiv"')).toBe("testvenueeqarXiv");
    });
  });

  describe("i18n keys for news table columns", () => {
    it("has domain label in both languages", () => {
      expect(dict.en.news.domain).toBe("Domain");
      expect(dict.zh.news.domain).toBe("域名");
    });

    it("has freshness label in both languages", () => {
      expect(dict.en.news.freshness).toBe("Freshness");
      expect(dict.zh.news.freshness).toBe("时效");
    });

    it("has snippet label in both languages", () => {
      expect(dict.en.news.snippet).toBe("Snippet");
      expect(dict.zh.news.snippet).toBe("摘要");
    });

    it("has all required column header keys", () => {
      const en = dict.en;
      expect(en.common.title).toBeDefined();
      expect(en.list.source).toBeDefined();
      expect(en.news.domain).toBeDefined();
      expect(en.detail.topics).toBeDefined();
      expect(en.list.publishedAt).toBeDefined();
      expect(en.news.snippet).toBeDefined();
      expect(en.news.freshness).toBeDefined();
    });
  });
});
