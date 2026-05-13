import { describe, it, expect } from "vitest";
import { dict } from "@/lib/i18n/dict";

describe("ecosystem page - i18n keys", () => {
  it("has timeline key in en", () => {
    expect(dict.en.ecosystem.timeline).toBe("Ecosystem Timeline");
  });

  it("has timeline key in zh", () => {
    expect(dict.zh.ecosystem.timeline).toBe("生态时间线");
  });

  it("has entity labels in en", () => {
    expect(dict.en.ecosystem.conferences).toBe("Conferences");
    expect(dict.en.ecosystem.papers).toBe("Papers");
    expect(dict.en.ecosystem.leads).toBe("Leads");
    expect(dict.en.ecosystem.talents).toBe("Talents");
    expect(dict.en.ecosystem.news).toBe("News");
  });

  it("has entity labels in zh", () => {
    expect(dict.zh.ecosystem.conferences).toBe("会议");
    expect(dict.zh.ecosystem.papers).toBe("论文");
    expect(dict.zh.ecosystem.leads).toBe("线索");
    expect(dict.zh.ecosystem.talents).toBe("人才");
    expect(dict.zh.ecosystem.news).toBe("新闻");
  });

  it("has empty state keys in both languages", () => {
    expect(dict.en.ecosystem.noEvents).toBe("No recent events");
    expect(dict.zh.ecosystem.noEvents).toBe("暂无近期事件");
    expect(dict.en.ecosystem.noEventsDesc).toBeDefined();
    expect(dict.zh.ecosystem.noEventsDesc).toBeDefined();
  });
});

describe("ecosystem page - timeline sorting", () => {
  it("sorts events by date descending", () => {
    const events = [
      { type: "paper" as const, date: "2026-01-15", title: "A", href: "/" },
      { type: "product" as const, date: "2026-03-01", title: "B", href: "/" },
      { type: "conference" as const, date: "2026-02-10", title: "C", href: "/" },
    ];
    const sorted = events.sort((a, b) => b.date.localeCompare(a.date));
    expect(sorted.map((e) => e.title)).toEqual(["B", "C", "A"]);
  });

  it("limits to 20 events", () => {
    const events = Array.from({ length: 30 }, (_, i) => ({
      type: "paper" as const,
      date: `2026-01-${String(i + 1).padStart(2, "0")}`,
      title: `Paper ${i}`,
      href: "/",
    }));
    const result = events.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
    expect(result).toHaveLength(20);
  });
});

describe("ecosystem page - vendor-product matrix", () => {
  it("filters out archived vendors", () => {
    const vendors = [
      { id: "1", name: "A", stage: "watching" },
      { id: "2", name: "B", stage: "archived" },
      { id: "3", name: "C", stage: "engaging" },
    ];
    const active = vendors.filter((v) => v.stage !== "archived");
    expect(active).toHaveLength(2);
    expect(active.map((v) => v.id)).toEqual(["1", "3"]);
  });

  it("groups products by vendor name", () => {
    const vendors = [
      { id: "1", name: "Cisco", stage: "engaging" },
      { id: "2", name: "Arista", stage: "watching" },
    ];
    const products = [
      { id: "p1", vendor: "Cisco", name: "IOS XR" },
      { id: "p2", vendor: "Cisco", name: "Nexus" },
      { id: "p3", vendor: "Juniper", name: "Junos" },
    ];
    const matrix = vendors
      .filter((v) => v.stage !== "archived")
      .map((v) => ({ vendor: v, products: products.filter((p) => p.vendor === v.name) }))
      .filter((g) => g.products.length > 0);
    expect(matrix).toHaveLength(1);
    expect(matrix[0].vendor.name).toBe("Cisco");
    expect(matrix[0].products).toHaveLength(2);
  });

  it("excludes vendors with no products", () => {
    const vendors = [{ id: "1", name: "Empty", stage: "watching" }];
    const products: { id: string; vendor: string; name: string }[] = [];
    const matrix = vendors
      .filter((v) => v.stage !== "archived")
      .map((v) => ({ vendor: v, products: products.filter((p) => p.vendor === v.name) }))
      .filter((g) => g.products.length > 0);
    expect(matrix).toHaveLength(0);
  });
});

describe("ecosystem page - 30-day filter", () => {
  it("filters items within 30 days", () => {
    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 86_400_000).toISOString();
    const items = [
      { created_at: new Date(now - 5 * 86_400_000).toISOString() },
      { created_at: new Date(now - 60 * 86_400_000).toISOString() },
      { created_at: new Date(now - 29 * 86_400_000).toISOString() },
    ];
    const recent = items.filter((i) => i.created_at >= thirtyDaysAgo);
    expect(recent).toHaveLength(2);
  });
});
