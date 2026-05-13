import { describe, it, expect } from "vitest";
import { PRODUCT_SORTABLE } from "../products";
import { validateSort } from "../pagination";
import { dict } from "@/lib/i18n/dict";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_PRICING,
  PRODUCT_STAGES,
} from "../types";

describe("products table", () => {
  it("PRODUCT_SORTABLE includes expected columns", () => {
    expect(PRODUCT_SORTABLE).toContain("name");
    expect(PRODUCT_SORTABLE).toContain("vendor");
    expect(PRODUCT_SORTABLE).toContain("category");
    expect(PRODUCT_SORTABLE).toContain("release_date");
    expect(PRODUCT_SORTABLE).toContain("stage");
  });

  it("PRODUCT_SORTABLE has exactly 5 entries", () => {
    expect(PRODUCT_SORTABLE).toHaveLength(5);
  });

  it("validates sort against PRODUCT_SORTABLE", () => {
    const valid = validateSort("name", "asc", PRODUCT_SORTABLE, "created_at", "desc");
    expect(valid).toEqual({ column: "name", ascending: true });

    const invalid = validateSort("random_col", "asc", PRODUCT_SORTABLE, "created_at", "desc");
    expect(invalid).toEqual({ column: "created_at", ascending: false });
  });

  it("defaults sort to created_at DESC", () => {
    const result = validateSort(undefined, undefined, PRODUCT_SORTABLE, "created_at", "desc");
    expect(result).toEqual({ column: "created_at", ascending: false });
  });
});

describe("product type enums", () => {
  it("PRODUCT_CATEGORIES has 6 entries", () => {
    expect(PRODUCT_CATEGORIES).toHaveLength(6);
    expect(PRODUCT_CATEGORIES).toContain("platform");
    expect(PRODUCT_CATEGORIES).toContain("tool");
    expect(PRODUCT_CATEGORIES).toContain("hardware");
    expect(PRODUCT_CATEGORIES).toContain("saas");
    expect(PRODUCT_CATEGORIES).toContain("library");
    expect(PRODUCT_CATEGORIES).toContain("other");
  });

  it("PRODUCT_PRICING has 6 entries", () => {
    expect(PRODUCT_PRICING).toHaveLength(6);
    expect(PRODUCT_PRICING).toContain("free");
    expect(PRODUCT_PRICING).toContain("freemium");
    expect(PRODUCT_PRICING).toContain("paid");
    expect(PRODUCT_PRICING).toContain("enterprise");
    expect(PRODUCT_PRICING).toContain("open-source");
    expect(PRODUCT_PRICING).toContain("unknown");
  });

  it("PRODUCT_STAGES has 4 entries", () => {
    expect(PRODUCT_STAGES).toHaveLength(4);
    expect(PRODUCT_STAGES).toContain("watching");
    expect(PRODUCT_STAGES).toContain("evaluating");
    expect(PRODUCT_STAGES).toContain("using");
    expect(PRODUCT_STAGES).toContain("archived");
  });
});

describe("product i18n keys", () => {
  it("has nav.products in both languages", () => {
    expect(dict.en.nav.products).toBe("Products");
    expect(dict.zh.nav.products).toBe("产品");
  });

  it("has product section keys in en", () => {
    const p = dict.en.product;
    expect(p.title).toBe("Products");
    expect(p.newProduct).toBeDefined();
    expect(p.editProduct).toBeDefined();
    expect(p.category).toBeDefined();
    expect(p.pricing).toBeDefined();
    expect(p.latestVersion).toBeDefined();
    expect(p.releaseDate).toBeDefined();
    expect(p.changelogUrl).toBeDefined();
  });

  it("has product section keys in zh", () => {
    const p = dict.zh.product;
    expect(p.title).toBe("产品追踪");
    expect(p.newProduct).toBe("新建产品");
    expect(p.category).toBe("分类");
    expect(p.pricing).toBe("定价");
  });

  it("has product category labels in both languages", () => {
    expect(dict.en.product.platform).toBe("Platform");
    expect(dict.zh.product.platform).toBe("平台");
    expect(dict.en.product.saas).toBe("SaaS");
    expect(dict.zh.product.saas).toBe("SaaS");
  });

  it("has product stage labels in both languages", () => {
    expect(dict.en.product.watching).toBe("Watching");
    expect(dict.zh.product.watching).toBe("关注中");
    expect(dict.en.product.archived).toBe("Archived");
    expect(dict.zh.product.archived).toBe("已归档");
  });

  it("has empty state keys for products", () => {
    expect(dict.en.empty.products).toBeDefined();
    expect(dict.en.empty.productsDesc).toBeDefined();
    expect(dict.zh.empty.products).toBeDefined();
    expect(dict.zh.empty.productsDesc).toBeDefined();
  });

  it("has dashboard.products in both languages", () => {
    expect(dict.en.dashboard.products).toBe("Products");
    expect(dict.zh.dashboard.products).toBe("产品");
  });
});
