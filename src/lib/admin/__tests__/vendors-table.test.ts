import { describe, it, expect } from "vitest";
import { VENDOR_SORTABLE } from "../vendors";
import { validateSort } from "../pagination";
import { dict } from "@/lib/i18n/dict";
import { VENDOR_TYPES, VENDOR_STAGES } from "../types";

describe("vendors table", () => {
  it("VENDOR_SORTABLE includes expected columns", () => {
    expect(VENDOR_SORTABLE).toContain("name");
    expect(VENDOR_SORTABLE).toContain("type");
    expect(VENDOR_SORTABLE).toContain("founded_year");
    expect(VENDOR_SORTABLE).toContain("stage");
  });

  it("VENDOR_SORTABLE has exactly 4 entries", () => {
    expect(VENDOR_SORTABLE).toHaveLength(4);
  });

  it("validates sort against VENDOR_SORTABLE", () => {
    const valid = validateSort("name", "asc", VENDOR_SORTABLE, "created_at", "desc");
    expect(valid).toEqual({ column: "name", ascending: true });

    const invalid = validateSort("random_col", "asc", VENDOR_SORTABLE, "created_at", "desc");
    expect(invalid).toEqual({ column: "created_at", ascending: false });
  });

  it("defaults sort to created_at DESC", () => {
    const result = validateSort(undefined, undefined, VENDOR_SORTABLE, "created_at", "desc");
    expect(result).toEqual({ column: "created_at", ascending: false });
  });
});

describe("vendor type enums", () => {
  it("VENDOR_TYPES has 5 entries", () => {
    expect(VENDOR_TYPES).toHaveLength(5);
    expect(VENDOR_TYPES).toContain("vendor");
    expect(VENDOR_TYPES).toContain("partner");
    expect(VENDOR_TYPES).toContain("competitor");
    expect(VENDOR_TYPES).toContain("startup");
    expect(VENDOR_TYPES).toContain("academic");
  });

  it("VENDOR_STAGES has 4 entries", () => {
    expect(VENDOR_STAGES).toHaveLength(4);
    expect(VENDOR_STAGES).toContain("watching");
    expect(VENDOR_STAGES).toContain("engaging");
    expect(VENDOR_STAGES).toContain("partnered");
    expect(VENDOR_STAGES).toContain("archived");
  });
});

describe("vendor i18n keys", () => {
  it("has nav.vendors in both languages", () => {
    expect(dict.en.nav.vendors).toBe("Vendors");
    expect(dict.zh.nav.vendors).toBe("厂商");
  });

  it("has vendor section keys in en", () => {
    const v = dict.en.vendor;
    expect(v.title).toBe("Vendors");
    expect(v.newVendor).toBeDefined();
    expect(v.editVendor).toBeDefined();
    expect(v.type).toBeDefined();
    expect(v.hqLocation).toBeDefined();
    expect(v.foundedYear).toBeDefined();
    expect(v.employeeRange).toBeDefined();
    expect(v.keyProducts).toBeDefined();
  });

  it("has vendor section keys in zh", () => {
    const v = dict.zh.vendor;
    expect(v.title).toBe("厂商管理");
    expect(v.newVendor).toBe("新建厂商");
    expect(v.type).toBe("类型");
    expect(v.hqLocation).toBe("总部地点");
  });

  it("has vendor type labels in both languages", () => {
    expect(dict.en.vendor.vendorType).toBe("Vendor");
    expect(dict.zh.vendor.vendorType).toBe("厂商");
    expect(dict.en.vendor.startup).toBe("Startup");
    expect(dict.zh.vendor.startup).toBe("创业公司");
  });

  it("has vendor stage labels in both languages", () => {
    expect(dict.en.vendor.watching).toBe("Watching");
    expect(dict.zh.vendor.watching).toBe("关注中");
    expect(dict.en.vendor.partnered).toBe("Partnered");
    expect(dict.zh.vendor.partnered).toBe("已合作");
  });

  it("has empty state keys for vendors", () => {
    expect(dict.en.empty.vendors).toBeDefined();
    expect(dict.en.empty.vendorsDesc).toBeDefined();
    expect(dict.zh.empty.vendors).toBeDefined();
    expect(dict.zh.empty.vendorsDesc).toBeDefined();
  });

  it("has dashboard.vendors in both languages", () => {
    expect(dict.en.dashboard.vendors).toBe("Vendors");
    expect(dict.zh.dashboard.vendors).toBe("厂商");
  });
});
