import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const seedDir = join(process.cwd(), "supabase");
const sessionFiles = readdirSync(seedDir)
  .filter((f) => f.match(/^seed_.*_sessions\.sql$/))
  .sort();

const validSlugs = [
  "dc-networking", "transport-protocols", "programmable-net", "sdn-nfv", "congestion-ctrl",
  "internet-measure", "traffic-analysis", "dns-bgp", "network-monitoring",
  "ddos-defense", "protocol-security", "privacy-anonymity", "side-channels",
  "edge-computing", "network-ai", "machine-learning", "optimization",
  "5g-wireless", "5g-6g", "mobile-wireless", "ebpf-xdp",
  "distributed-sys", "storage-net", "os-network-stack", "cloud-infra",
  "hpc", "high-speed-networking", "parallel-computing",
];

describe("conference session seed files", () => {
  it("has at least 8 session seed files", () => {
    expect(sessionFiles.length).toBeGreaterThanOrEqual(8);
  });

  it("includes new seed files from FR #152", () => {
    const expected = [
      "seed_ndss26_sessions.sql",
      "seed_sp26_sessions.sql",
      "seed_sigcomm26_sessions.sql",
      "seed_osdi26_sessions.sql",
      "seed_conext26_sessions.sql",
      "seed_usenixsec26_sessions.sql",
    ];
    for (const name of expected) {
      expect(sessionFiles).toContain(name);
    }
  });

  for (const file of sessionFiles) {
    describe(file, () => {
      const sql = readFileSync(join(seedDir, file), "utf-8");

      it("has at least one session record", () => {
        const titleCount = (sql.match(/,\s*ARRAY\[/g) ?? []).length;
        expect(titleCount).toBeGreaterThan(0);
      });

      it("uses valid topic slugs", () => {
        const topicArrays = [...sql.matchAll(/ARRAY\['([a-z0-9-]+(?:','[a-z0-9-]+)*)'\]/g)];
        for (const m of topicArrays) {
          const slugs = m[1].split("','");
          for (const slug of slugs) {
            expect(validSlugs).toContain(slug);
          }
        }
      });

      it("references a conference_id", () => {
        const hasConferenceRef = sql.includes("conference_id") || sql.includes("cid");
        expect(hasConferenceRef).toBe(true);
      });
    });
  }
});
