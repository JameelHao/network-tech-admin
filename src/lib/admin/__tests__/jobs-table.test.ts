import { describe, it, expect } from "vitest";
import { JOBS_SORTABLE } from "../jobs";
import { parsePaginationParams, validateSort } from "../pagination";
import { dict } from "@/lib/i18n/dict";

describe("jobs table refactor", () => {
  it("JOBS_SORTABLE includes title, source, pub_date", () => {
    expect(JOBS_SORTABLE).toContain("title");
    expect(JOBS_SORTABLE).toContain("source");
    expect(JOBS_SORTABLE).toContain("pub_date");
  });

  it("JOBS_SORTABLE has exactly 3 entries", () => {
    expect(JOBS_SORTABLE).toHaveLength(3);
  });

  it("defaults to page size 25", () => {
    const params = parsePaginationParams({}, { pageSize: 25 });
    expect(params.pageSize).toBe(25);
    expect(params.page).toBe(1);
  });

  it("parses page from searchParams", () => {
    const params = parsePaginationParams({ page: "3" }, { pageSize: 25 });
    expect(params.page).toBe(3);
    expect(params.pageSize).toBe(25);
  });

  it("validates sort against JOBS_SORTABLE", () => {
    const valid = validateSort("title", "asc", JOBS_SORTABLE, "pub_date", "desc");
    expect(valid).toEqual({ column: "title", ascending: true });

    const invalid = validateSort("random_col", "asc", JOBS_SORTABLE, "pub_date", "desc");
    expect(invalid).toEqual({ column: "pub_date", ascending: false });
  });

  it("defaults sort to pub_date DESC", () => {
    const result = validateSort(undefined, undefined, JOBS_SORTABLE, "pub_date", "desc");
    expect(result).toEqual({ column: "pub_date", ascending: false });
  });

  it("validates sort direction", () => {
    const asc = validateSort("source", "asc", JOBS_SORTABLE, "pub_date", "desc");
    expect(asc).toEqual({ column: "source", ascending: true });

    const desc = validateSort("source", "desc", JOBS_SORTABLE, "pub_date", "desc");
    expect(desc).toEqual({ column: "source", ascending: false });
  });

  describe("i18n keys for jobs table columns", () => {
    it("has company label in both languages", () => {
      expect(dict.en.jobs.company).toBe("Company");
      expect(dict.zh.jobs.company).toBe("公司");
    });

    it("has location label in both languages", () => {
      expect(dict.en.jobs.location).toBe("Location");
      expect(dict.zh.jobs.location).toBe("地点");
    });

    it("has status label in both languages", () => {
      expect(dict.en.jobs.status).toBe("Status");
      expect(dict.zh.jobs.status).toBe("状态");
    });

    it("has active label in both languages", () => {
      expect(dict.en.jobs.active).toBe("Active");
      expect(dict.zh.jobs.active).toBe("有效");
    });

    it("has freshness label in both languages", () => {
      expect(dict.en.jobs.freshness).toBe("Freshness");
      expect(dict.zh.jobs.freshness).toBe("时效");
    });

    it("has allStatuses label in both languages", () => {
      expect(dict.en.jobs.allStatuses).toBe("All statuses");
      expect(dict.zh.jobs.allStatuses).toBe("全部状态");
    });

    it("has all required column header keys", () => {
      const en = dict.en;
      expect(en.common.title).toBeDefined();
      expect(en.jobs.company).toBeDefined();
      expect(en.jobs.location).toBeDefined();
      expect(en.list.source).toBeDefined();
      expect(en.detail.topics).toBeDefined();
      expect(en.list.publishedAt).toBeDefined();
      expect(en.jobs.status).toBeDefined();
      expect(en.jobs.freshness).toBeDefined();
    });

    it("has search and filter labels", () => {
      expect(dict.en.jobs.searchPlaceholder).toBeDefined();
      expect(dict.en.jobs.allSources).toBeDefined();
      expect(dict.en.jobs.noMatch).toBeDefined();
      expect(dict.zh.jobs.searchPlaceholder).toBeDefined();
      expect(dict.zh.jobs.allSources).toBeDefined();
      expect(dict.zh.jobs.noMatch).toBeDefined();
    });
  });
});
