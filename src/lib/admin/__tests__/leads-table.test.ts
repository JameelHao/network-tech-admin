import { describe, it, expect } from "vitest";
import { LEAD_SORTABLE } from "../leads";
import { parsePaginationParams, validateSort } from "../pagination";
import { dict } from "@/lib/i18n/dict";

describe("leads table expansion", () => {
  it("LEAD_SORTABLE includes all expected columns", () => {
    expect(LEAD_SORTABLE).toContain("title");
    expect(LEAD_SORTABLE).toContain("stage");
    expect(LEAD_SORTABLE).toContain("source_type");
    expect(LEAD_SORTABLE).toContain("source_label");
    expect(LEAD_SORTABLE).toContain("created_at");
    expect(LEAD_SORTABLE).toContain("updated_at");
  });

  it("LEAD_SORTABLE has exactly 6 entries", () => {
    expect(LEAD_SORTABLE).toHaveLength(6);
  });

  it("defaults to page size 50", () => {
    const params = parsePaginationParams({});
    expect(params.pageSize).toBe(50);
    expect(params.page).toBe(1);
  });

  it("validates sort against LEAD_SORTABLE", () => {
    const valid = validateSort("source_type", "asc", LEAD_SORTABLE, "updated_at", "desc");
    expect(valid).toEqual({ column: "source_type", ascending: true });

    const invalid = validateSort("random_col", "asc", LEAD_SORTABLE, "updated_at", "desc");
    expect(invalid).toEqual({ column: "updated_at", ascending: false });
  });

  it("validates source_label sort", () => {
    const result = validateSort("source_label", "desc", LEAD_SORTABLE, "updated_at", "desc");
    expect(result).toEqual({ column: "source_label", ascending: false });
  });

  it("defaults sort to updated_at DESC", () => {
    const result = validateSort(undefined, undefined, LEAD_SORTABLE, "updated_at", "desc");
    expect(result).toEqual({ column: "updated_at", ascending: false });
  });

  describe("i18n keys for leads table columns", () => {
    it("has summary label in both languages", () => {
      expect(dict.en.leads.summary).toBe("Summary");
      expect(dict.zh.leads.summary).toBe("摘要");
    });

    it("has sourceType label in both languages", () => {
      expect(dict.en.leads.sourceType).toBe("Source Type");
      expect(dict.zh.leads.sourceType).toBe("来源类型");
    });

    it("has sourceLabel label in both languages", () => {
      expect(dict.en.leads.sourceLabel).toBe("Source Label");
      expect(dict.zh.leads.sourceLabel).toBe("来源名称");
    });

    it("has notes label in both languages", () => {
      expect(dict.en.leads.notes).toBe("Notes");
      expect(dict.zh.leads.notes).toBe("备注");
    });

    it("has all required column header keys", () => {
      const en = dict.en;
      expect(en.common.title).toBeDefined();
      expect(en.leads.summary).toBeDefined();
      expect(en.leads.sourceType).toBeDefined();
      expect(en.leads.sourceLabel).toBeDefined();
      expect(en.leads.stage).toBeDefined();
      expect(en.leads.notes).toBeDefined();
      expect(en.list.createdAt).toBeDefined();
      expect(en.leads.updatedAt).toBeDefined();
    });

    it("has existing leads keys intact", () => {
      expect(dict.en.leads.title).toBe("Tech Leads");
      expect(dict.en.leads.stage).toBe("Stage");
      expect(dict.en.leads.source).toBe("Source");
      expect(dict.zh.leads.title).toBe("技术线索");
      expect(dict.zh.leads.stage).toBe("阶段");
      expect(dict.zh.leads.source).toBe("来源");
    });
  });
});
