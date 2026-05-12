import { describe, it, expect } from "vitest";
import { PAPER_SORTABLE } from "../papers";
import { parsePaginationParams, validateSort } from "../pagination";
import { dict } from "@/lib/i18n/dict";

describe("papers table refactor", () => {
  it("PAPER_SORTABLE includes title, published_date, venue", () => {
    expect(PAPER_SORTABLE).toContain("title");
    expect(PAPER_SORTABLE).toContain("published_date");
    expect(PAPER_SORTABLE).toContain("venue");
  });

  it("defaults to page size 25 when parsed with default", () => {
    const params = parsePaginationParams({}, { pageSize: 25 });
    expect(params.pageSize).toBe(25);
    expect(params.page).toBe(1);
  });

  it("accepts 25, 50, 100 as valid page sizes", () => {
    expect(parsePaginationParams({ size: "25" }).pageSize).toBe(25);
    expect(parsePaginationParams({ size: "50" }).pageSize).toBe(50);
    expect(parsePaginationParams({ size: "100" }).pageSize).toBe(100);
  });

  it("rejects invalid page sizes", () => {
    const params = parsePaginationParams({ size: "30" }, { pageSize: 25 });
    expect(params.pageSize).toBe(25);
  });

  it("validates sort against PAPER_SORTABLE", () => {
    const valid = validateSort("title", "asc", PAPER_SORTABLE, "published_date", "desc");
    expect(valid).toEqual({ column: "title", ascending: true });

    const invalid = validateSort("random_col", "asc", PAPER_SORTABLE, "published_date", "desc");
    expect(invalid).toEqual({ column: "published_date", ascending: false });
  });

  it("defaults sort to published_date DESC", () => {
    const result = validateSort(undefined, undefined, PAPER_SORTABLE, "published_date", "desc");
    expect(result).toEqual({ column: "published_date", ascending: false });
  });

  it("parses search params for papers filters", () => {
    const params = parsePaginationParams({
      page: "2",
      size: "25",
      sort: "title",
      dir: "asc",
      search: "rdma",
    });
    expect(params.page).toBe(2);
    expect(params.pageSize).toBe(25);
    expect(params.sort).toBe("title");
    expect(params.dir).toBe("asc");
    expect(params.search).toBe("rdma");
  });

  describe("i18n keys for papers table columns", () => {
    it("has affiliations label in both languages", () => {
      expect(dict.en.papers.affiliations).toBe("Affiliations");
      expect(dict.zh.papers.affiliations).toBe("机构");
    });

    it("has status label in both languages", () => {
      expect(dict.en.papers.status).toBe("Status");
      expect(dict.zh.papers.status).toBe("状态");
    });

    it("has citations label in both languages", () => {
      expect(dict.en.papers.citations).toBe("Citations");
      expect(dict.zh.papers.citations).toBe("引用");
    });

    it("has all required column header keys", () => {
      const en = dict.en;
      expect(en.common.title).toBeDefined();
      expect(en.detail.authors).toBeDefined();
      expect(en.papers.affiliations).toBeDefined();
      expect(en.detail.venue).toBeDefined();
      expect(en.detail.topics).toBeDefined();
      expect(en.list.publishedAt).toBeDefined();
      expect(en.papers.status).toBeDefined();
      expect(en.papers.citations).toBeDefined();
      expect(en.list.link).toBeDefined();
    });
  });
});
