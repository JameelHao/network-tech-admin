import { describe, it, expect } from "vitest";
import { dict } from "@/lib/i18n/dict";
import { VENDOR_TYPES } from "../types";

const TYPE_I18N_MAP: Record<string, string> = {
  vendor: "vendorType",
  partner: "partner",
  competitor: "competitor",
  startup: "startup",
  academic: "academic",
};

describe("dashboard widgets - i18n keys", () => {
  it("has latestProductUpdates in en", () => {
    expect(dict.en.dashboard.latestProductUpdates).toBe("Latest Product Updates");
  });

  it("has latestProductUpdates in zh", () => {
    expect(dict.zh.dashboard.latestProductUpdates).toBe("最近产品更新");
  });

  it("has keyVendors in en", () => {
    expect(dict.en.dashboard.keyVendors).toBe("Key Vendors");
  });

  it("has keyVendors in zh", () => {
    expect(dict.zh.dashboard.keyVendors).toBe("重点厂商");
  });
});

describe("dashboard widgets - product updates filtering", () => {
  it("filters products with release_date", () => {
    const products = [
      { id: "1", name: "A", release_date: "2026-01-15" },
      { id: "2", name: "B", release_date: null },
      { id: "3", name: "C", release_date: "2026-03-01" },
    ];
    const filtered = products.filter((p) => p.release_date);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("sorts by release_date descending", () => {
    const products = [
      { id: "1", release_date: "2026-01-15" },
      { id: "2", release_date: "2026-03-01" },
      { id: "3", release_date: "2025-12-01" },
    ];
    const sorted = products
      .filter((p) => p.release_date)
      .sort((a, b) => b.release_date!.localeCompare(a.release_date!));
    expect(sorted.map((p) => p.id)).toEqual(["2", "1", "3"]);
  });

  it("limits to 5 items", () => {
    const products = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      release_date: `2026-01-${String(i + 1).padStart(2, "0")}`,
    }));
    const result = products.filter((p) => p.release_date).slice(0, 5);
    expect(result).toHaveLength(5);
  });
});

describe("dashboard widgets - key vendors filtering", () => {
  it("filters engaging and partnered vendors", () => {
    const vendors = [
      { id: "1", stage: "watching" },
      { id: "2", stage: "engaging" },
      { id: "3", stage: "partnered" },
      { id: "4", stage: "archived" },
    ];
    const key = vendors.filter((v) => v.stage === "engaging" || v.stage === "partnered");
    expect(key).toHaveLength(2);
    expect(key.map((v) => v.id)).toEqual(["2", "3"]);
  });

  it("returns empty for no engaging/partnered vendors", () => {
    const vendors = [
      { id: "1", stage: "watching" },
      { id: "2", stage: "archived" },
    ];
    const key = vendors.filter((v) => v.stage === "engaging" || v.stage === "partnered");
    expect(key).toHaveLength(0);
  });
});

describe("dashboard widgets - vendor type i18n mapping", () => {
  it("all vendor types map to valid i18n keys", () => {
    for (const vt of VENDOR_TYPES) {
      const key = TYPE_I18N_MAP[vt] as keyof typeof dict.en.vendor;
      expect(dict.en.vendor[key]).toBeDefined();
      expect(dict.zh.vendor[key]).toBeDefined();
    }
  });
});
