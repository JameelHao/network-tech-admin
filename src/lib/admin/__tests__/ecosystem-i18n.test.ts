import { describe, it, expect } from "vitest";
import { dict } from "@/lib/i18n/dict";

describe("ecosystem i18n keys", () => {
  it("has nav.ecosystem in both languages", () => {
    expect(dict.en.nav.ecosystem).toBe("Ecosystem");
    expect(dict.zh.nav.ecosystem).toBe("生态");
  });

  it("has ecosystem section keys in en", () => {
    const e = dict.en.ecosystem;
    expect(e.title).toBe("Ecosystem Overview");
    expect(e.products).toBe("Products");
    expect(e.vendors).toBe("Vendors");
    expect(e.topicCoverage).toBe("Topic Coverage");
    expect(e.recentUpdates).toBe("Recent Updates");
    expect(e.vendorProductMatrix).toBe("Vendor-Product Matrix");
  });

  it("has ecosystem section keys in zh", () => {
    const e = dict.zh.ecosystem;
    expect(e.title).toBe("生态总览");
    expect(e.products).toBe("产品");
    expect(e.vendors).toBe("厂商");
    expect(e.topicCoverage).toBe("主题覆盖");
    expect(e.recentUpdates).toBe("最近更新");
  });

  it("has command palette entries for products and vendors", () => {
    expect(dict.en.command.goToProducts).toBe("Go to Products");
    expect(dict.en.command.goToVendors).toBe("Go to Vendors");
    expect(dict.en.command.products).toBe("Products");
    expect(dict.en.command.vendors).toBe("Vendors");
    expect(dict.zh.command.goToProducts).toBe("前往产品");
    expect(dict.zh.command.goToVendors).toBe("前往厂商");
    expect(dict.zh.command.products).toBe("产品");
    expect(dict.zh.command.vendors).toBe("厂商");
  });
});

describe("sidebar navigation structure", () => {
  it("en nav has all required keys for new modules", () => {
    const nav = dict.en.nav;
    expect(nav.products).toBeDefined();
    expect(nav.vendors).toBeDefined();
    expect(nav.ecosystem).toBeDefined();
  });

  it("zh nav has all required keys for new modules", () => {
    const nav = dict.zh.nav;
    expect(nav.products).toBeDefined();
    expect(nav.vendors).toBeDefined();
    expect(nav.ecosystem).toBeDefined();
  });
});
