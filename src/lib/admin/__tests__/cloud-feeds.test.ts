import { describe, it, expect } from "vitest";
import {
  extractTag,
  cleanHTML,
  parseItems,
  matchesNetworking,
  mapTopics,
  truncate,
  FEEDS,
  TOPIC_KEYWORDS,
  type FeedItem,
} from "../cloud-feeds";

describe("cloud-feeds", () => {
  // ── extractTag ─────────────────────────────────────────────────

  describe("extractTag", () => {
    it("extracts content between open/close tags", () => {
      expect(extractTag("<title>Hello World</title>", "title")).toBe("Hello World");
    });

    it("extracts self-closing link href", () => {
      expect(extractTag('<link href="https://example.com" />', "link")).toBe("https://example.com");
    });

    it("returns empty string for missing tag", () => {
      expect(extractTag("<foo>bar</foo>", "title")).toBe("");
    });

    it("handles CDATA content", () => {
      expect(extractTag("<title><![CDATA[Test CDATA]]></title>", "title")).toBe(
        "<![CDATA[Test CDATA]]>",
      );
    });

    it("handles tag with attributes", () => {
      expect(extractTag('<description type="html">Some text</description>', "description")).toBe(
        "Some text",
      );
    });
  });

  // ── cleanHTML ──────────────────────────────────────────────────

  describe("cleanHTML", () => {
    it("strips HTML tags", () => {
      expect(cleanHTML("<p>Hello <b>World</b></p>")).toBe("Hello World");
    });

    it("decodes HTML entities", () => {
      expect(cleanHTML("&lt;test&gt; &amp; &quot;quoted&quot; &#39;apos&#39;")).toBe(
        '<test> & "quoted" \'apos\'',
      );
    });

    it("unwraps CDATA", () => {
      expect(cleanHTML("<![CDATA[content here]]>")).toBe("content here");
    });

    it("collapses whitespace", () => {
      expect(cleanHTML("line1\n   line2\n   line3")).toBe("line1 line2 line3");
    });

    it("trims result", () => {
      expect(cleanHTML("  spaced  ")).toBe("spaced");
    });
  });

  // ── parseItems ─────────────────────────────────────────────────

  describe("parseItems", () => {
    const rssXml = `
      <rss><channel>
        <item>
          <title>New VPC Feature</title>
          <link>https://aws.amazon.com/vpc</link>
          <description>VPC networking update</description>
          <pubDate>Mon, 01 Jan 2026 00:00:00 GMT</pubDate>
        </item>
        <item>
          <title>Load Balancer Update</title>
          <link>https://aws.amazon.com/elb</link>
          <description>ELB improvements</description>
          <pubDate>Tue, 02 Jan 2026 00:00:00 GMT</pubDate>
        </item>
      </channel></rss>
    `;

    it("parses RSS items", () => {
      const items = parseItems(rssXml);
      expect(items).toHaveLength(2);
      expect(items[0].title).toBe("New VPC Feature");
      expect(items[0].link).toBe("https://aws.amazon.com/vpc");
      expect(items[0].description).toBe("VPC networking update");
    });

    it("parses Atom entries", () => {
      const atom = `
        <feed>
          <entry>
            <title>GCP Network Update</title>
            <link href="https://cloud.google.com/net" />
            <summary>Network improvements</summary>
            <updated>2026-01-01T00:00:00Z</updated>
          </entry>
        </feed>
      `;
      const items = parseItems(atom);
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe("GCP Network Update");
      expect(items[0].link).toBe("https://cloud.google.com/net");
    });

    it("skips items without title", () => {
      const bad = "<rss><channel><item><link>x</link></item></channel></rss>";
      expect(parseItems(bad)).toHaveLength(0);
    });

    it("falls back to summary or content for description", () => {
      const xml = `
        <feed><entry>
          <title>Test</title>
          <link href="https://x.com" />
          <content>Content text</content>
          <updated>2026-01-01T00:00:00Z</updated>
        </entry></feed>
      `;
      const items = parseItems(xml);
      expect(items[0].description).toBe("Content text");
    });

    it("assigns current date when no pubDate found", () => {
      const xml = "<rss><channel><item><title>No date</title><link>x</link></item></channel></rss>";
      const items = parseItems(xml);
      expect(items[0].pubDate).toBeTruthy();
    });
  });

  // ── matchesNetworking ──────────────────────────────────────────

  describe("matchesNetworking", () => {
    it("matches when keyword found in title", () => {
      const item: FeedItem = { title: "New VPC feature", link: "", description: "", pubDate: "" };
      expect(matchesNetworking(item, ["vpc", "cdn"])).toBe(true);
    });

    it("matches when keyword found in description", () => {
      const item: FeedItem = { title: "Update", link: "", description: "Load balancer changes", pubDate: "" };
      expect(matchesNetworking(item, ["load balancer"])).toBe(true);
    });

    it("rejects when no keyword matches", () => {
      const item: FeedItem = { title: "New AI model", link: "", description: "ML updates", pubDate: "" };
      expect(matchesNetworking(item, ["vpc", "cdn", "network"])).toBe(false);
    });

    it("keeps all items when keywords array is empty (Cloudflare)", () => {
      const item: FeedItem = { title: "Anything at all", link: "", description: "random", pubDate: "" };
      expect(matchesNetworking(item, [])).toBe(true);
    });

    it("is case-insensitive", () => {
      const item: FeedItem = { title: "AWS VPC Update", link: "", description: "", pubDate: "" };
      expect(matchesNetworking(item, ["vpc"])).toBe(true);
    });
  });

  // ── mapTopics ──────────────────────────────────────────────────

  describe("mapTopics", () => {
    it("maps VPC to cloud-infra", () => {
      const item: FeedItem = { title: "VPC peering update", link: "", description: "", pubDate: "" };
      expect(mapTopics(item)).toContain("cloud-infra");
    });

    it("maps CDN to edge-computing", () => {
      const item: FeedItem = { title: "CloudFront performance", link: "", description: "", pubDate: "" };
      expect(mapTopics(item)).toContain("edge-computing");
    });

    it("maps firewall/WAF to ddos-defense", () => {
      const item: FeedItem = { title: "WAF rule updates", link: "", description: "", pubDate: "" };
      expect(mapTopics(item)).toContain("ddos-defense");
    });

    it("maps DNS to dns-bgp", () => {
      const item: FeedItem = { title: "Route 53 new records", link: "", description: "", pubDate: "" };
      expect(mapTopics(item)).toContain("dns-bgp");
    });

    it("maps zero trust to zero-trust", () => {
      const item: FeedItem = { title: "Zero Trust access", link: "", description: "", pubDate: "" };
      expect(mapTopics(item)).toContain("zero-trust");
    });

    it("maps monitoring to network-monitoring", () => {
      const item: FeedItem = { title: "Network observability launch", link: "", description: "", pubDate: "" };
      expect(mapTopics(item)).toContain("network-monitoring");
    });

    it("maps VPN to protocol-security", () => {
      const item: FeedItem = { title: "VPN gateway update", link: "", description: "", pubDate: "" };
      expect(mapTopics(item)).toContain("protocol-security");
    });

    it("maps eBPF to ebpf-xdp", () => {
      const item: FeedItem = { title: "eBPF acceleration", link: "", description: "", pubDate: "" };
      expect(mapTopics(item)).toContain("ebpf-xdp");
    });

    it("maps multiple topics from single item", () => {
      const item: FeedItem = { title: "VPC firewall with DNS", link: "", description: "", pubDate: "" };
      const topics = mapTopics(item);
      expect(topics).toContain("cloud-infra");
      expect(topics).toContain("ddos-defense");
      expect(topics).toContain("dns-bgp");
    });

    it("defaults to cloud-infra when no keyword matches", () => {
      const item: FeedItem = { title: "General platform update", link: "", description: "", pubDate: "" };
      expect(mapTopics(item)).toEqual(["cloud-infra"]);
    });

    it("returns sorted topics", () => {
      const item: FeedItem = { title: "WAF + VPN + DNS", link: "", description: "", pubDate: "" };
      const topics = mapTopics(item);
      const sorted = [...topics].sort();
      expect(topics).toEqual(sorted);
    });
  });

  // ── truncate ───────────────────────────────────────────────────

  describe("truncate", () => {
    it("returns text unchanged when within limit", () => {
      expect(truncate("short", 200)).toBe("short");
    });

    it("truncates long text with ellipsis", () => {
      const long = "a".repeat(210);
      const result = truncate(long, 200);
      expect(result).toHaveLength(200);
      expect(result.endsWith("...")).toBe(true);
    });

    it("handles exact boundary", () => {
      const exact = "a".repeat(200);
      expect(truncate(exact, 200)).toBe(exact);
    });
  });

  // ── FEEDS config ───────────────────────────────────────────────

  describe("FEEDS config", () => {
    it("has 4 cloud providers", () => {
      expect(FEEDS).toHaveLength(4);
      const vendors = FEEDS.map((f) => f.vendor).sort();
      expect(vendors).toEqual(["aws", "azure", "cloudflare", "gcp"]);
    });

    it("Cloudflare has empty keywords (keep all)", () => {
      const cf = FEEDS.find((f) => f.vendor === "cloudflare");
      expect(cf?.keywords).toEqual([]);
    });

    it("all feeds have HTTPS URLs", () => {
      for (const feed of FEEDS) {
        expect(feed.url).toMatch(/^https:\/\//);
      }
    });

    it("non-Cloudflare feeds have networking keywords", () => {
      for (const feed of FEEDS) {
        if (feed.vendor !== "cloudflare") {
          expect(feed.keywords.length).toBeGreaterThan(0);
        }
      }
    });
  });

  // ── TOPIC_KEYWORDS config ──────────────────────────────────────

  describe("TOPIC_KEYWORDS config", () => {
    it("all slugs are valid topic slugs", () => {
      const validSlugs = [
        "cloud-infra", "edge-computing", "ddos-defense", "zero-trust",
        "dns-bgp", "network-monitoring", "5g-6g", "satellite-leo",
        "protocol-security", "ebpf-xdp", "sdn-nfv",
      ];
      for (const [, slug] of TOPIC_KEYWORDS) {
        expect(validSlugs).toContain(slug);
      }
    });

    it("all entries have RegExp + string slug", () => {
      for (const entry of TOPIC_KEYWORDS) {
        expect(entry[0]).toBeInstanceOf(RegExp);
        expect(typeof entry[1]).toBe("string");
      }
    });
  });
});
