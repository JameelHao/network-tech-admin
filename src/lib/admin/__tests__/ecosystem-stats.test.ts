import { describe, it, expect } from "vitest";
import {
  aggregateTopicMatrix,
  buildVendorTopicMap,
  getTopicQuarterlyTrend,
  buildOpenSourceBubbles,
} from "../ecosystem-stats";

describe("aggregateTopicMatrix", () => {
  const papers = [
    { topics: ["dc-networking", "transport-protocols"] },
    { topics: ["dc-networking", "sdn-nfv"] },
  ];
  const conferences = [{ topics: ["dc-networking"] }];
  const products = [{ topics: ["sdn-nfv", "cloud-infra"] }];
  const opensource = [{ topics: ["ebpf-xdp"] }];
  const vendors = [{ topics: ["dc-networking", "cloud-infra"] }];

  it("returns rows for topics with data", () => {
    const result = aggregateTopicMatrix(papers, conferences, products, opensource, vendors);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r) => r.total > 0)).toBe(true);
  });

  it("counts papers correctly for dc-networking", () => {
    const result = aggregateTopicMatrix(papers, conferences, products, opensource, vendors);
    const dc = result.find((r) => r.slug === "dc-networking");
    expect(dc).toBeDefined();
    expect(dc!.papers).toBe(2);
    expect(dc!.conferences).toBe(1);
    expect(dc!.vendors).toBe(1);
    expect(dc!.total).toBe(4);
  });

  it("includes category for each row", () => {
    const result = aggregateTopicMatrix(papers, conferences, products, opensource, vendors);
    for (const r of result) {
      expect(["network-systems", "measurement", "security", "emerging", "infrastructure"]).toContain(r.category);
    }
  });

  it("filters out topics with zero total", () => {
    const result = aggregateTopicMatrix([], [], [], [], []);
    expect(result.length).toBe(0);
  });

  it("handles unknown topic slugs gracefully", () => {
    const result = aggregateTopicMatrix([{ topics: ["unknown-topic"] }], [], [], [], []);
    expect(result.every((r) => r.slug !== "unknown-topic")).toBe(true);
  });
});

describe("buildVendorTopicMap", () => {
  const vendors = [
    { id: "v1", name: "Cisco", topics: ["dc-networking", "sdn-nfv"], key_products: ["Cisco ACI"], stage: "engaging" as const },
    { id: "v2", name: "Archived Co", topics: ["cloud-infra"], key_products: [], stage: "archived" as const },
  ];
  const products = [
    { name: "Cisco ACI", topics: ["sdn-nfv", "programmable-net"] },
  ];

  it("excludes archived vendors", () => {
    const result = buildVendorTopicMap(vendors, products);
    expect(result.length).toBe(1);
    expect(result[0].vendorName).toBe("Cisco");
  });

  it("merges vendor topics with product topics", () => {
    const result = buildVendorTopicMap(vendors, products);
    const cisco = result[0];
    expect(cisco.topics).toContain("dc-networking");
    expect(cisco.topics).toContain("sdn-nfv");
    expect(cisco.topics).toContain("programmable-net");
  });

  it("tracks product topic mapping", () => {
    const result = buildVendorTopicMap(vendors, products);
    expect(result[0].productTopics["Cisco ACI"]).toEqual(["sdn-nfv", "programmable-net"]);
  });

  it("returns empty for no vendors", () => {
    expect(buildVendorTopicMap([], [])).toEqual([]);
  });

  it("handles vendor with no matching products", () => {
    const result = buildVendorTopicMap(
      [{ id: "v3", name: "Solo", topics: ["cloud-infra"], key_products: ["NoMatch"], stage: "watching" as const }],
      [],
    );
    expect(result[0].topics).toEqual(["cloud-infra"]);
    expect(Object.keys(result[0].productTopics)).toEqual([]);
  });
});

describe("getTopicQuarterlyTrend", () => {
  const papers = [
    { topics: ["dc-networking", "transport-protocols"], published_date: "2025-01-15" },
    { topics: ["dc-networking"], published_date: "2025-01-20" },
    { topics: ["dc-networking", "sdn-nfv"], published_date: "2025-04-10" },
    { topics: ["transport-protocols"], published_date: "2025-04-05" },
  ];

  it("groups by quarter", () => {
    const result = getTopicQuarterlyTrend(papers, 3);
    expect(result.length).toBe(2);
    expect(result[0].quarter).toBe("2025 Q1");
    expect(result[1].quarter).toBe("2025 Q2");
  });

  it("counts top-N topics", () => {
    const result = getTopicQuarterlyTrend(papers, 2);
    const keys = Object.keys(result[0]).filter((k) => k !== "quarter");
    expect(keys.length).toBe(2);
    expect(keys).toContain("dc-networking");
  });

  it("returns empty for no papers", () => {
    expect(getTopicQuarterlyTrend([], 5)).toEqual([]);
  });

  it("skips papers without published_date", () => {
    const result = getTopicQuarterlyTrend(
      [{ topics: ["dc-networking"], published_date: null as unknown as string }],
      5,
    );
    expect(result).toEqual([]);
  });

  it("sorts quarters chronologically", () => {
    const mixed = [
      { topics: ["dc-networking"], published_date: "2025-07-01" },
      { topics: ["dc-networking"], published_date: "2024-01-01" },
    ];
    const result = getTopicQuarterlyTrend(mixed, 5);
    expect(result[0].quarter).toBe("2024 Q1");
    expect(result[1].quarter).toBe("2025 Q3");
  });
});

describe("buildOpenSourceBubbles", () => {
  const opensource = [
    { name: "Cilium", stars: 18000, topics: ["ebpf-xdp", "cloud-infra"], last_active: "2025-05-01", repo_url: "https://github.com/cilium/cilium" },
    { name: "FRRouting", stars: 3000, topics: ["transport-protocols"], last_active: "2025-04-20", repo_url: "https://github.com/FRRouting/frr" },
  ];

  it("maps each project to a bubble point", () => {
    const result = buildOpenSourceBubbles(opensource);
    expect(result.length).toBe(2);
  });

  it("assigns category from first topic", () => {
    const result = buildOpenSourceBubbles(opensource);
    expect(result[0].category).toBe("emerging");
    expect(result[1].category).toBe("network-systems");
  });

  it("preserves stars and metadata", () => {
    const result = buildOpenSourceBubbles(opensource);
    expect(result[0].stars).toBe(18000);
    expect(result[0].name).toBe("Cilium");
    expect(result[0].repoUrl).toBe("https://github.com/cilium/cilium");
  });

  it("handles empty topics with 'other' category", () => {
    const result = buildOpenSourceBubbles([
      { name: "Mystery", stars: 100, topics: [], last_active: "2025-01-01", repo_url: "https://github.com/x/y" },
    ]);
    expect(result[0].category).toBe("other");
  });

  it("returns empty for no data", () => {
    expect(buildOpenSourceBubbles([])).toEqual([]);
  });
});
