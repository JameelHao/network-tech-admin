import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const sql = readFileSync(join(process.cwd(), "supabase/seed_conferences_historical.sql"), "utf-8");

const validCategories = ["network-systems", "measurement", "security", "emerging", "infrastructure"];
const validTiers = ["top", "good", "workshop"];
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

const rows = sql.split(/\)\s*ON CONFLICT/);
const allValueBlocks = sql.match(/VALUES\n([\s\S]*?)\nON CONFLICT/g) ?? [];
const allRecords = allValueBlocks.flatMap((block) =>
  block.replace(/^VALUES\n/, "").replace(/\nON CONFLICT.*$/, "").split(/\),\s*\n\(/)
);

describe("seed_conferences_historical.sql", () => {
  it("has >= 24 records for 2024-2025", () => {
    const records2024_2025 = allRecords.filter(
      (r) => r.includes("2024-") || r.includes("2025-")
    );
    expect(records2024_2025.length).toBeGreaterThanOrEqual(24);
  });

  it("has >= 7 records for 2023 (top-tier)", () => {
    const records2023 = allRecords.filter((r) => r.includes("2023-"));
    expect(records2023.length).toBeGreaterThanOrEqual(7);
  });

  it("uses ON CONFLICT (abbreviation, start_date) DO NOTHING", () => {
    const conflicts = sql.match(/ON CONFLICT \(abbreviation, start_date\) DO NOTHING/g) ?? [];
    expect(conflicts.length).toBe(3);
  });

  it("uses valid category values", () => {
    const categoryMatches = [...sql.matchAll(/'(network-systems|measurement|security|emerging|infrastructure)'/g)];
    expect(categoryMatches.length).toBeGreaterThan(0);
    for (const m of categoryMatches) {
      expect(validCategories).toContain(m[1]);
    }
  });

  it("uses valid tier values", () => {
    const tierMatches = [...sql.matchAll(/',\s*'(top|good|workshop)'/g)];
    expect(tierMatches.length).toBeGreaterThan(0);
    for (const m of tierMatches) {
      expect(validTiers).toContain(m[1]);
    }
  });

  it("uses valid topic slugs", () => {
    const topicArrays = [...sql.matchAll(/ARRAY\['([a-z0-9-]+(?:','[a-z0-9-]+)*)'\]/g)];
    expect(topicArrays.length).toBeGreaterThan(0);
    for (const m of topicArrays) {
      const slugs = m[1].split("','");
      for (const slug of slugs) {
        expect(validSlugs).toContain(slug);
      }
    }
  });

  it("has valid date format (YYYY-MM-DD)", () => {
    const dates = [...sql.matchAll(/'(\d{4}-\d{2}-\d{2})'/g)];
    expect(dates.length).toBeGreaterThan(0);
    for (const m of dates) {
      const d = new Date(m[1]);
      expect(d.toString()).not.toBe("Invalid Date");
    }
  });

  it("end_date is after start_date for each record", () => {
    const datePairs = [...sql.matchAll(/'(\d{4}-\d{2}-\d{2})',\s*'(\d{4}-\d{2}-\d{2})'/g)];
    expect(datePairs.length).toBeGreaterThan(0);
    for (const m of datePairs) {
      expect(new Date(m[2]).getTime()).toBeGreaterThanOrEqual(new Date(m[1]).getTime());
    }
  });

  it("does NOT start with DELETE FROM conferences", () => {
    expect(sql.trim().startsWith("DELETE")).toBe(false);
  });

  it("has no empty topics arrays", () => {
    const emptyArrays = (sql.match(/ARRAY\[\]/g) ?? []).length;
    expect(emptyArrays).toBe(0);
  });

  it("covers at least 4 categories", () => {
    const found = validCategories.filter((cat) => sql.includes(`'${cat}'`));
    expect(found.length).toBeGreaterThanOrEqual(4);
  });

  it("handles OSDI/SOSP alternation correctly", () => {
    const osdi2024 = sql.includes("'OSDI'") && sql.includes("2024-");
    const sosp2024 = sql.includes("'SOSP'") && sql.match(/'SOSP'.*2024-/);
    const sosp2023 = sql.includes("'SOSP'") && sql.match(/'SOSP'.*2023-/);
    const osdi2023 = sql.match(/'OSDI'.*2023-/);

    expect(osdi2024).toBe(true);
    expect(sosp2024).toBeFalsy();
    expect(sosp2023).toBeTruthy();
    expect(osdi2023).toBeFalsy();
  });

  it("2023 records are all top-tier", () => {
    const section2023 = sql.split("2023 Conferences")[1] ?? "";
    const tiers = [...section2023.matchAll(/'(top|good|workshop)'/g)];
    for (const m of tiers) {
      expect(m[1]).toBe("top");
    }
  });
});
