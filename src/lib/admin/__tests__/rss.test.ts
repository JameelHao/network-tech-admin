import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchRSSItemsWithStats, getJobsFeeds, getNewsFeeds } from "../rss";
import type { FetchResult } from "../rss";

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <item>
    <title>Network Engineer at Google</title>
    <link>https://example.com/job1</link>
    <description>Exciting role in networking</description>
    <pubDate>Mon, 12 May 2026 10:00:00 GMT</pubDate>
  </item>
  <item>
    <title>SDN Developer Position</title>
    <link>https://example.com/job2</link>
    <description>Work on SDN infrastructure</description>
    <pubDate>Sun, 11 May 2026 09:00:00 GMT</pubDate>
  </item>
</channel>
</rss>`;

const BLOCKED_HTML = `<html><body><h1>Blocked</h1></body></html>`;

describe("rss module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("JOBS_FEEDS", () => {
    it("no longer uses Indeed sources", () => {
      const feeds = getJobsFeeds();
      for (const feed of feeds) {
        expect(feed.url).not.toContain("indeed.com");
      }
    });

    it("has Google News RSS sources for target companies", () => {
      const feeds = getJobsFeeds();
      const googleFeeds = feeds.filter((f) => f.url.includes("news.google.com"));
      expect(googleFeeds.length).toBe(7);

      const sources = googleFeeds.map((f) => f.source);
      expect(sources).toContain("Amazon/AWS");
      expect(sources).toContain("Cloudflare");
      expect(sources).toContain("Google");
      expect(sources).toContain("Meta");
      expect(sources).toContain("Microsoft");
      expect(sources).toContain("xAI");
      expect(sources).toContain("Juniper/Cisco/Arista");
    });

    it("has RemoteOK as supplementary source", () => {
      const feeds = getJobsFeeds();
      expect(feeds.some((f) => f.url.includes("remoteok.com"))).toBe(true);
    });

    it("HN Jobs uses tightened keywords", () => {
      const feeds = getJobsFeeds();
      const hn = feeds.find((f) => f.source === "HN Jobs");
      expect(hn).toBeDefined();
      expect(hn!.url).toContain("datacenter+networking");
      expect(hn!.url).toContain("BGP");
      expect(hn!.url).not.toContain("OR+networking+OR+infrastructure");
    });
  });

  describe("NEWS_FEEDS", () => {
    it("has 13 news sources", () => {
      expect(getNewsFeeds().length).toBe(13);
    });

    it("includes Chinese tech feeds", () => {
      const feeds = getNewsFeeds();
      const sources = feeds.map((f) => f.source);
      expect(sources).toContain("InfoQ 中文");
      expect(sources).toContain("开源中国");
      expect(sources).toContain("FreeBuf");
      expect(sources).toContain("Cloudflare 中文");
      expect(sources).toContain("LWN.net");
    });

    it("Chinese feeds have valid RSS URLs", () => {
      const feeds = getNewsFeeds();
      const cnFeeds = feeds.filter((f) =>
        ["InfoQ 中文", "开源中国", "FreeBuf", "Cloudflare 中文", "LWN.net"].includes(f.source),
      );
      expect(cnFeeds.length).toBe(5);
      for (const feed of cnFeeds) {
        expect(feed.url).toMatch(/^https:\/\//);
      }
    });
  });

  describe("parseRSSXml with Chinese content", () => {
    it("parses Chinese RSS items correctly", async () => {
      const chineseRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <item>
    <title>云原生网络架构演进：从 SDN 到 eBPF</title>
    <link>https://example.cn/article/1</link>
    <description>本文介绍了云原生网络架构的演进历程</description>
    <pubDate>Tue, 13 May 2026 08:00:00 GMT</pubDate>
  </item>
  <item>
    <title><![CDATA[深入理解 Kubernetes CNI 插件：Cilium & Calico 对比]]></title>
    <link>https://example.cn/article/2</link>
    <description><![CDATA[<p>从性能、安全和可观测性三个维度对比两大 CNI 方案</p>]]></description>
    <pubDate>Mon, 12 May 2026 12:00:00 GMT</pubDate>
  </item>
</channel>
</rss>`;

      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(chineseRss),
      }));

      const result = await fetchRSSItemsWithStats(
        [{ url: "https://example.cn/rss", source: "中文测试" }],
        10,
      );

      expect(result.items).toHaveLength(2);
      expect(result.items[0].title).toBe("云原生网络架构演进：从 SDN 到 eBPF");
      expect(result.items[0].source).toBe("中文测试");
      expect(result.items[1].title).toBe("深入理解 Kubernetes CNI 插件：Cilium & Calico 对比");
      expect(result.items[1].snippet).toContain("从性能、安全和可观测性");
      expect(result.feedStats[0]).toEqual({ source: "中文测试", status: "ok", count: 2 });
    });
  });

  describe("fetchRSSItemsWithStats", () => {
    it("returns items and feedStats on success", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(SAMPLE_RSS),
      }));

      const result: FetchResult = await fetchRSSItemsWithStats(
        [{ url: "https://test.com/rss", source: "TestSource" }],
        10,
      );

      expect(result.items).toHaveLength(2);
      expect(result.items[0].title).toBe("Network Engineer at Google");
      expect(result.items[0].source).toBe("TestSource");
      expect(result.feedStats).toHaveLength(1);
      expect(result.feedStats[0]).toEqual({ source: "TestSource", status: "ok", count: 2 });
    });

    it("marks feed as error when response is blocked HTML", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(BLOCKED_HTML),
      }));

      const result = await fetchRSSItemsWithStats(
        [{ url: "https://blocked.com/rss", source: "BlockedSource" }],
        10,
      );

      expect(result.items).toHaveLength(0);
      expect(result.feedStats[0]).toEqual({
        source: "BlockedSource",
        status: "error",
        count: 0,
        error: "not RSS/XML",
      });
    });

    it("marks feed as error on HTTP failure", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: () => Promise.resolve("Forbidden"),
      }));

      const result = await fetchRSSItemsWithStats(
        [{ url: "https://forbidden.com/rss", source: "Forbidden" }],
        10,
      );

      expect(result.items).toHaveLength(0);
      expect(result.feedStats[0]).toEqual({
        source: "Forbidden",
        status: "error",
        count: 0,
        error: "HTTP 403",
      });
    });

    it("marks feed as error on network failure", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));

      const result = await fetchRSSItemsWithStats(
        [{ url: "https://timeout.com/rss", source: "Timeout" }],
        10,
      );

      expect(result.items).toHaveLength(0);
      expect(result.feedStats[0]).toEqual({
        source: "Timeout",
        status: "error",
        count: 0,
        error: "timeout",
      });
    });

    it("deduplicates items by link", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(SAMPLE_RSS),
      }));

      const result = await fetchRSSItemsWithStats(
        [
          { url: "https://a.com/rss", source: "A" },
          { url: "https://b.com/rss", source: "B" },
        ],
        10,
      );

      expect(result.items).toHaveLength(2);
      expect(result.feedStats).toHaveLength(2);
    });

    it("respects limit parameter", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(SAMPLE_RSS),
      }));

      const result = await fetchRSSItemsWithStats(
        [{ url: "https://test.com/rss", source: "Test" }],
        1,
      );

      expect(result.items).toHaveLength(1);
    });

    it("sorts items by pubDate descending", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(SAMPLE_RSS),
      }));

      const result = await fetchRSSItemsWithStats(
        [{ url: "https://test.com/rss", source: "Test" }],
        10,
      );

      expect(result.items[0].title).toBe("Network Engineer at Google");
      expect(result.items[1].title).toBe("SDN Developer Position");
    });

    it("handles mix of successful and failed feeds", async () => {
      let callCount = 0;
      vi.stubGlobal("fetch", vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ ok: true, text: () => Promise.resolve(SAMPLE_RSS) });
        }
        return Promise.resolve({ ok: false, status: 500, text: () => Promise.resolve("error") });
      }));

      const result = await fetchRSSItemsWithStats(
        [
          { url: "https://good.com/rss", source: "Good" },
          { url: "https://bad.com/rss", source: "Bad" },
        ],
        10,
      );

      expect(result.items).toHaveLength(2);
      expect(result.feedStats).toHaveLength(2);
      expect(result.feedStats.find((s) => s.source === "Good")?.status).toBe("ok");
      expect(result.feedStats.find((s) => s.source === "Bad")?.status).toBe("error");
    });
  });
});
