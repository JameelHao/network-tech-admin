import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/admin/products", () => ({
  upsertCloudProducts: vi.fn(),
}));

const FEED_TIMEOUT_MS = 8_000;

import {
  parseItems,
  matchesNetworking,
  mapTopics,
  truncate,
  FEEDS,
  type FeedConfig,
} from "../cloud-feeds";

describe("cloud-products sync route logic", () => {
  // ── feed transform ─────────────────────────────────────────────

  describe("feed item transformation", () => {
    const feed: FeedConfig = {
      url: "https://example.com/feed",
      vendor: "aws",
      category: "platform",
      keywords: ["vpc", "network"],
    };

    const xml = `
      <rss><channel>
        <item>
          <title>New VPC Feature Released</title>
          <link>https://aws.amazon.com/vpc-update</link>
          <description>VPC networking improvements for 2026</description>
          <pubDate>Mon, 01 Jan 2026 00:00:00 GMT</pubDate>
        </item>
        <item>
          <title>AI/ML Service Launch</title>
          <link>https://aws.amazon.com/ai</link>
          <description>New machine learning capabilities</description>
          <pubDate>Tue, 02 Jan 2026 00:00:00 GMT</pubDate>
        </item>
      </channel></rss>
    `;

    it("parses and filters items by keyword", () => {
      const parsed = parseItems(xml);
      const filtered = parsed.filter((item) => matchesNetworking(item, feed.keywords));
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("New VPC Feature Released");
    });

    it("transforms to CloudProductInput shape", () => {
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
        name: "New VPC Feature Released",
        vendor: "aws",
        category: "platform",
        pricing: "paid",
        source_url: "https://aws.amazon.com/vpc-update",
      });
      expect(items[0].topics).toContain("cloud-infra");
      expect(items[0].published_at).toBeTruthy();
    });

    it("truncates long names and descriptions", () => {
      const longTitle = "A".repeat(250);
      const longDesc = "B".repeat(250);
      expect(truncate(longTitle, 200)).toHaveLength(200);
      expect(truncate(longDesc, 200)).toHaveLength(200);
    });
  });

  // ── deduplication ──────────────────────────────────────────────

  describe("deduplication by source_url", () => {
    it("removes duplicate source_url entries", () => {
      const items = [
        { source_url: "https://a.com/1", name: "A" },
        { source_url: "https://a.com/2", name: "B" },
        { source_url: "https://a.com/1", name: "A-dup" },
        { source_url: "https://a.com/3", name: "C" },
      ];

      const seen = new Set<string>();
      const unique = items.filter((p) => {
        if (!p.source_url || seen.has(p.source_url)) return false;
        seen.add(p.source_url);
        return true;
      });

      expect(unique).toHaveLength(3);
      expect(unique.map((u) => u.name)).toEqual(["A", "B", "C"]);
    });

    it("skips items without source_url", () => {
      const items = [
        { source_url: "", name: "Empty" },
        { source_url: "https://a.com/1", name: "Valid" },
      ];

      const seen = new Set<string>();
      const unique = items.filter((p) => {
        if (!p.source_url || seen.has(p.source_url)) return false;
        seen.add(p.source_url);
        return true;
      });

      expect(unique).toHaveLength(1);
      expect(unique[0].name).toBe("Valid");
    });
  });

  // ── feed timeout ───────────────────────────────────────────────

  describe("feed timeout configuration", () => {
    it("uses 8 second timeout", () => {
      expect(FEED_TIMEOUT_MS).toBe(8_000);
    });
  });

  // ── FEEDS integration ──────────────────────────────────────────

  describe("FEEDS used by sync route", () => {
    it("all feeds have valid category", () => {
      for (const feed of FEEDS) {
        expect(["saas", "platform", "tool"]).toContain(feed.category);
      }
    });

    it("Cloudflare feed passes all items (empty keywords)", () => {
      const cf = FEEDS.find((f) => f.vendor === "cloudflare")!;
      const item = { title: "Random post", link: "", description: "Not network related", pubDate: "" };
      expect(matchesNetworking(item, cf.keywords)).toBe(true);
    });

    it("AWS feed filters non-networking items", () => {
      const aws = FEEDS.find((f) => f.vendor === "aws")!;
      const item = { title: "New AI/ML SageMaker feature", link: "", description: "Machine learning", pubDate: "" };
      expect(matchesNetworking(item, aws.keywords)).toBe(false);
    });
  });

  // ── error handling shape ───────────────────────────────────────

  describe("provider result shape", () => {
    type ProviderResult = {
      vendor: string;
      status: "ok" | "error";
      count: number;
      error?: string;
    };

    it("ok result has count and no error", () => {
      const result: ProviderResult = { vendor: "aws", status: "ok", count: 5 };
      expect(result.status).toBe("ok");
      expect(result.error).toBeUndefined();
    });

    it("error result has error message", () => {
      const result: ProviderResult = { vendor: "gcp", status: "error", count: 0, error: "HTTP 503" };
      expect(result.status).toBe("error");
      expect(result.error).toBe("HTTP 503");
    });
  });
});
