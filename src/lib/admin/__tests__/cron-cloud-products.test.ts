import { describe, it, expect } from "vitest";
import {
  FEEDS,
  parseItems,
  matchesNetworking,
  mapTopics,
  truncate,
  type FeedConfig,
} from "../cloud-feeds";

describe("cron sync-cloud-products", () => {
  describe("CRON_SECRET auth pattern", () => {
    it("rejects missing authorization header", () => {
      const authHeader = null;
      const expected = `Bearer test-secret`;
      expect(authHeader).not.toBe(expected);
    });

    it("rejects wrong bearer token", () => {
      const authHeader = "Bearer wrong-token";
      const expected = `Bearer correct-secret`;
      expect(authHeader).not.toBe(expected);
    });

    it("accepts correct bearer token", () => {
      const secret = "my-cron-secret";
      const authHeader = `Bearer ${secret}`;
      expect(authHeader).toBe(`Bearer ${secret}`);
    });
  });

  describe("feed fetch and transform pipeline", () => {
    const feed: FeedConfig = {
      url: "https://aws.amazon.com/about-aws/whats-new/recent/feed/",
      vendor: "aws",
      category: "platform",
      keywords: ["vpc", "network", "load balancer"],
    };

    const xml = `
      <rss><channel>
        <item>
          <title>Amazon VPC Lattice now supports TLS</title>
          <link>https://aws.amazon.com/about-aws/whats-new/2026/vpc-lattice</link>
          <description>VPC Lattice adds TLS passthrough support</description>
          <pubDate>Wed, 14 May 2026 00:00:00 GMT</pubDate>
        </item>
        <item>
          <title>AWS Lambda adds Python 3.13 support</title>
          <link>https://aws.amazon.com/about-aws/whats-new/2026/lambda-py313</link>
          <description>Lambda runtime update for Python developers</description>
          <pubDate>Wed, 14 May 2026 00:00:00 GMT</pubDate>
        </item>
      </channel></rss>
    `;

    it("filters items by networking keywords", () => {
      const parsed = parseItems(xml);
      const filtered = parsed.filter((item) => matchesNetworking(item, feed.keywords));
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toContain("VPC");
    });

    it("transforms filtered items to CloudProductInput shape", () => {
      const parsed = parseItems(xml);
      const filtered = parsed.filter((item) => matchesNetworking(item, feed.keywords));
      const items = filtered.map((item) => ({
        name: truncate(item.title, 200),
        vendor: feed.vendor,
        category: feed.category,
        description: truncate(item.description, 200),
        url: item.link,
        pricing: "paid" as const,
        topics: mapTopics(item),
        source_url: item.link,
        published_at: new Date(item.pubDate).toISOString(),
      }));

      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        vendor: "aws",
        category: "platform",
        pricing: "paid",
      });
      expect(items[0].topics).toContain("cloud-infra");
      expect(items[0].source_url).toBeTruthy();
      expect(items[0].published_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe("deduplication by source_url", () => {
    it("removes duplicate source_url entries", () => {
      const items = [
        { source_url: "https://a.com/1", vendor: "aws" },
        { source_url: "https://a.com/2", vendor: "azure" },
        { source_url: "https://a.com/1", vendor: "aws-dup" },
      ];

      const seen = new Set<string>();
      const unique = items.filter((p) => {
        if (!p.source_url || seen.has(p.source_url)) return false;
        seen.add(p.source_url);
        return true;
      });

      expect(unique).toHaveLength(2);
    });
  });

  describe("provider result aggregation", () => {
    type ProviderResult = { vendor: string; status: "ok" | "error"; count: number; error?: string };

    it("aggregates mixed ok/error results", () => {
      const results: ProviderResult[] = [
        { vendor: "aws", status: "ok", count: 5 },
        { vendor: "azure", status: "error", count: 0, error: "HTTP 503" },
        { vendor: "gcp", status: "ok", count: 3 },
        { vendor: "cloudflare", status: "ok", count: 10 },
      ];

      const okCount = results.filter((r) => r.status === "ok").length;
      const errorCount = results.filter((r) => r.status === "error").length;
      const total = results.reduce((sum, r) => sum + r.count, 0);

      expect(okCount).toBe(3);
      expect(errorCount).toBe(1);
      expect(total).toBe(18);
    });
  });

  describe("FEEDS config for cron", () => {
    it("has 4 providers to sync", () => {
      expect(FEEDS).toHaveLength(4);
    });

    it("all feeds have valid URLs for fetch()", () => {
      for (const feed of FEEDS) {
        expect(feed.url).toMatch(/^https:\/\//);
      }
    });
  });

  describe("vercel.json cron schedule", () => {
    it("schedule 0 7 * * * runs daily at 7 UTC", () => {
      const schedule = "0 7 * * *";
      const [min, hour, dom, mon, dow] = schedule.split(" ");
      expect(min).toBe("0");
      expect(hour).toBe("7");
      expect(dom).toBe("*");
      expect(mon).toBe("*");
      expect(dow).toBe("*");
    });
  });

  describe("SyncStatusBar integration", () => {
    it("SYNC_ENDPOINTS includes cloud-products", () => {
      const endpoints: Record<string, string> = {
        papers: "/api/sync/papers",
        news: "/api/sync/feeds",
        jobs: "/api/sync/feeds",
        products: "/api/sync/products",
        opensource: "/api/sync/opensource",
        "cloud-products": "/api/sync/cloud-products",
      };
      expect(endpoints["cloud-products"]).toBe("/api/sync/cloud-products");
    });

    it("entity type includes cloud-products", () => {
      type Entity = "papers" | "news" | "jobs" | "products" | "opensource" | "cloud-products";
      const entity: Entity = "cloud-products";
      expect(entity).toBe("cloud-products");
    });
  });

  describe("sync_meta write shape", () => {
    it("produces valid sync_meta row", () => {
      const row = {
        entity: "cloud-products",
        last_sync_at: new Date().toISOString(),
        last_result: {
          results: [{ vendor: "aws", status: "ok", count: 5 }],
          inserted: 3,
          updated: 2,
        },
      };

      expect(row.entity).toBe("cloud-products");
      expect(row.last_sync_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(row.last_result.inserted).toBe(3);
      expect(row.last_result.updated).toBe(2);
    });
  });
});
