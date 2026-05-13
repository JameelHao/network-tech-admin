import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const sql = readFileSync(join(process.cwd(), "supabase/seed_products.sql"), "utf-8");

const insertBlock = sql.split("VALUES")[1] ?? "";
const rows = insertBlock.split(/\),\s*\(/);

describe("seed_products.sql", () => {
  it("has at least 20 product records", () => {
    expect(rows.length).toBeGreaterThanOrEqual(20);
  });

  it("covers all 6 categories", () => {
    const categories = ["platform", "tool", "hardware", "saas", "library", "other"];
    for (const cat of categories) {
      expect(sql).toContain(`'${cat}'`);
    }
  });

  it("every row has a non-empty ARRAY for topics", () => {
    const emptyArrayCount = (sql.match(/ARRAY\[\]/g) ?? []).length;
    expect(emptyArrayCount).toBe(0);
  });

  it("uses valid topic slugs", () => {
    const validSlugs = [
      "dc-networking", "transport-protocols", "programmable-net", "sdn-nfv", "congestion-ctrl",
      "internet-measure", "traffic-analysis", "dns-bgp", "network-monitoring", "network-observability",
      "ddos-defense", "protocol-security", "privacy-anonymity", "side-channels", "zero-trust", "sase-sse",
      "edge-computing", "network-ai", "machine-learning", "optimization",
      "ai-networking", "network-digital-twin", "intent-based-networking", "satellite-leo", "quantum-networking",
      "5g-6g", "mobile-wireless", "ebpf-xdp",
      "distributed-sys", "storage-net", "os-network-stack", "cloud-infra",
      "hpc", "high-speed-networking", "parallel-computing",
    ];
    const slugMatches = sql.match(/'([a-z0-9-]+)'/g) ?? [];
    const topicSlugsInArrays = [...sql.matchAll(/ARRAY\[([^\]]+)\]/g)]
      .flatMap((m) => m[1].split(",").map((s) => s.trim().replace(/'/g, "")));
    for (const slug of topicSlugsInArrays) {
      expect(validSlugs).toContain(slug);
    }
  });

  it("starts with DELETE FROM products", () => {
    expect(sql.trim().startsWith("DELETE FROM products;")).toBe(true);
  });

  it("uses valid pricing values", () => {
    const validPricing = ["free", "freemium", "paid", "enterprise", "open-source", "unknown"];
    const pricingMatches = [...sql.matchAll(/,\s*'(free|freemium|paid|enterprise|open-source|unknown)'/g)];
    expect(pricingMatches.length).toBeGreaterThan(0);
    for (const m of pricingMatches) {
      expect(validPricing).toContain(m[1]);
    }
  });

  it("uses valid stage values", () => {
    const validStages = ["watching", "evaluating", "using", "archived"];
    const stageMatches = [...sql.matchAll(/'(watching|evaluating|using|archived)'\)/g)];
    expect(stageMatches.length).toBeGreaterThanOrEqual(20);
    for (const m of stageMatches) {
      expect(validStages).toContain(m[1]);
    }
  });
});
