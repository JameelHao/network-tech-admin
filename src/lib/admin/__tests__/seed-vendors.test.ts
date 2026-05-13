import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const sql = readFileSync(join(process.cwd(), "supabase/seed_vendors.sql"), "utf-8");

describe("seed_vendors.sql", () => {
  it("has at least 20 vendor records", () => {
    const stageEndings = (sql.match(/'(watching|engaging|partnered|archived)'\)/g) ?? []).length;
    expect(stageEndings).toBeGreaterThanOrEqual(20);
  });

  it("covers all 5 vendor types", () => {
    const types = ["vendor", "partner", "competitor", "startup", "academic"];
    for (const t of types) {
      expect(sql).toContain(`'${t}'`);
    }
  });

  it("uses valid topic slugs in topics ARRAY", () => {
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
    // Topics ARRAY is the second ARRAY in each row (after key_products ARRAY)
    const topicArrays = [...sql.matchAll(/ARRAY\[[^\]]*\],\s*ARRAY\[([^\]]*)\]/g)];
    expect(topicArrays.length).toBeGreaterThan(0);
    for (const m of topicArrays) {
      if (!m[1]) continue;
      const slugs = m[1].split(",").map((s) => s.trim().replace(/'/g, ""));
      for (const slug of slugs) {
        if (slug) expect(validSlugs).toContain(slug);
      }
    }
  });

  it("starts with DELETE FROM vendors", () => {
    expect(sql.trim().startsWith("DELETE FROM vendors;")).toBe(true);
  });

  it("uses valid stage values", () => {
    const validStages = ["watching", "engaging", "partnered", "archived"];
    const stageMatches = [...sql.matchAll(/'(watching|engaging|partnered|archived)'\)/g)];
    expect(stageMatches.length).toBeGreaterThanOrEqual(20);
    for (const m of stageMatches) {
      expect(validStages).toContain(m[1]);
    }
  });

  it("uses valid employee_range values", () => {
    const validRanges = ["1-50", "51-200", "201-1000", "1001-5000", "5000+"];
    const rangeMatches = [...sql.matchAll(/'(1-50|51-200|201-1000|1001-5000|5000\+)'/g)];
    expect(rangeMatches.length).toBeGreaterThan(0);
    for (const m of rangeMatches) {
      expect(validRanges).toContain(m[1]);
    }
  });

  it("has key_products referencing known product names", () => {
    const knownProducts = [
      "Cisco ACI", "VMware NSX", "Juniper Apstra", "Arista CloudVision",
      "Cloudflare Magic WAN", "Tailscale", "Zscaler ZIA/ZPA", "NetBox",
      "ThousandEyes", "NVIDIA Spectrum-4", "Broadcom 25G/100G",
      "Arista 7800R3 Series", "Juniper QFX5200", "Cilium",
    ];
    const keyProductArrays = [...sql.matchAll(/ARRAY\[([^\]]*)\],\s*ARRAY\[/g)];
    for (const m of keyProductArrays) {
      if (!m[1]) continue;
      const products = m[1].split(",").map((s) => s.trim().replace(/'/g, ""));
      for (const p of products) {
        if (p) expect(knownProducts).toContain(p);
      }
    }
  });
});
