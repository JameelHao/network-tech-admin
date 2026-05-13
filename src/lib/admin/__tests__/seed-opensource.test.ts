import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const sql = readFileSync(join(process.cwd(), "supabase/seed_opensource.sql"), "utf-8");

describe("seed_opensource.sql", () => {
  it("has at least 25 records", () => {
    const repoUrls = (sql.match(/https:\/\/github\.com\/[^']+/g) ?? []).length;
    expect(repoUrls).toBeGreaterThanOrEqual(25);
  });

  it("covers all 5 directions via comments", () => {
    const directions = ["Data Plane", "Control Plane", "Cloud Native", "eBPF", "Tools"];
    for (const d of directions) {
      expect(sql).toContain(`-- ${d}`);
    }
  });

  it("covers required languages", () => {
    const languages = ["C", "C++", "Go", "Python", "Java"];
    for (const lang of languages) {
      expect(sql).toContain(`'${lang}'`);
    }
  });

  it("uses valid topic slugs", () => {
    const validSlugs = [
      "dc-networking", "transport-protocols", "programmable-net", "sdn-nfv", "congestion-ctrl",
      "internet-measure", "traffic-analysis", "dns-bgp", "network-monitoring",
      "ddos-defense", "protocol-security", "privacy-anonymity", "side-channels",
      "edge-computing", "network-ai", "machine-learning", "optimization",
      "5g-wireless", "5g-6g", "mobile-wireless", "ebpf-xdp",
      "distributed-sys", "storage-net", "os-network-stack", "cloud-infra",
      "hpc", "high-speed-networking", "parallel-computing",
    ];
    const topicArrays = [...sql.matchAll(/ARRAY\[([^\]]+)\]/g)];
    expect(topicArrays.length).toBeGreaterThan(0);
    for (const m of topicArrays) {
      const slugs = m[1].split(",").map((s) => s.trim().replace(/'/g, ""));
      for (const slug of slugs) {
        if (slug) expect(validSlugs).toContain(slug);
      }
    }
  });

  it("starts with DELETE FROM opensource", () => {
    expect(sql.trim().startsWith("DELETE FROM opensource;")).toBe(true);
  });

  it("every record has a GitHub repo_url", () => {
    const rows = sql.split("VALUES")[1]?.split(/\),\s*[\n(]/) ?? [];
    const urlCount = rows.filter((r) => r.includes("https://github.com/")).length;
    expect(urlCount).toBeGreaterThanOrEqual(25);
  });

  it("every record has stars and last_active", () => {
    const starMatches = (sql.match(/,\s*\d+,\s*'\d{4}-\d{2}-\d{2}'/g) ?? []).length;
    expect(starMatches).toBeGreaterThanOrEqual(25);
  });

  it("has no empty topics arrays", () => {
    const emptyArrays = (sql.match(/ARRAY\[\]/g) ?? []).length;
    expect(emptyArrays).toBe(0);
  });
});
