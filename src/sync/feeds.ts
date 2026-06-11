import { inferCompanies } from "../lib/companies.js";
import { supabase } from "../lib/supabase.js";
import { filterQuality } from "../lib/ai-quality.js";
import type { RSSItem, FeedStat } from "../types/index.js";

const NEWS_FEEDS = [
  // --- Tech blogs & engineering ---
  { url: "https://blog.cloudflare.com/rss/", source: "Cloudflare Blog" },
  { url: "https://blog.cloudflare.com/zh-cn/rss/", source: "Cloudflare 中文" },
  { url: "https://aws.amazon.com/blogs/networking-and-content-delivery/feed/", source: "AWS Networking" },
  { url: "https://azure.microsoft.com/en-us/blog/feed/", source: "Azure Blog" },
  { url: "https://cloudblog.withgoogle.com/rss/", source: "Google Cloud Blog" },
  { url: "https://engineering.fb.com/category/networking-traffic/feed/", source: "Meta Engineering" },
  { url: "https://blogs.cisco.com/feed/", source: "Cisco Blogs" },
  { url: "https://developer.nvidia.com/blog/feed", source: "NVIDIA Developer" },
  { url: "https://netflixtechblog.com/feed", source: "Netflix Tech Blog" },
  { url: "https://www.uber.com/en-US/blog/engineering/rss/", source: "Uber Engineering" },
  // --- News & media ---
  { url: "https://feeds.arstechnica.com/arstechnica/technology-lab", source: "Ars Technica" },
  { url: "https://www.theregister.com/feed/", source: "The Register" },
  { url: "https://hnrss.org/newest?points=100&q=networking+OR+infrastructure+OR+datacenter+OR+BGP+OR+DNS+OR+CDN+OR+5G+OR+eBPF", source: "Hacker News" },
  { url: "https://www.lightreading.com/rss.xml", source: "Light Reading" },
  { url: "https://www.datacenterknowledge.com/rss.xml", source: "Data Center Knowledge" },
  // --- Networking community ---
  { url: "https://lwn.net/headlines/rss", source: "LWN.net" },
  { url: "https://blog.apnic.net/feed/", source: "APNIC Blog" },
  { url: "https://labs.ripe.net/rss/", source: "RIPE Labs" },
  { url: "https://www.potaroo.net/ispcol/recentcolumns.xml", source: "Potaroo (Geoff Huston)" },
  { url: "https://elegantnetwork.github.io/feed.xml", source: "Elegant Network" },
  { url: "https://packetpushers.net/feed/", source: "Packet Pushers" },
  // --- Chinese tech ---
  { url: "https://www.infoq.cn/feed", source: "InfoQ 中文" },
  { url: "https://www.oschina.net/news/rss", source: "开源中国" },
  // --- Google News company watches ---
  { url: "https://news.google.com/rss/search?q=%22Ericsson%22+network+OR+5G+OR+6G+OR+RAN+when:7d", source: "Ericsson" },
  { url: "https://news.google.com/rss/search?q=%22Nokia%22+network+OR+5G+OR+6G+OR+IP+optical+when:7d", source: "Nokia" },
  { url: "https://news.google.com/rss/search?q=OpenAI+network+OR+infrastructure+OR+distributed+OR+training+when:7d", source: "OpenAI" },
  { url: "https://news.google.com/rss/search?q=Anthropic+network+OR+infrastructure+OR+distributed+OR+training+when:7d", source: "Anthropic" },
  { url: "https://news.google.com/rss/search?q=%22Micron%22+network+OR+memory+OR+DDR5+OR+datacenter+when:7d", source: "Micron" },
  { url: "https://news.google.com/rss/search?q=%22Broadcom%22+network+OR+switch+OR+router+OR+silicon+when:7d", source: "Broadcom" },
  { url: "https://news.google.com/rss/search?q=%22Intel%22+network+OR+Ethernet+OR+datacenter+OR+IPU+OR+silicon+when:7d", source: "Intel" },
  { url: "https://news.google.com/rss/search?q=%22Apple%22+network+OR+infrastructure+OR+edge+OR+protocol+OR+wifi+when:7d", source: "Apple" },
  { url: "https://news.google.com/rss/search?q=%22AMD%22+network+OR+datacenter+OR+Pensando+OR+smart+nic+OR+DPU+when:7d", source: "AMD" },
  { url: "https://news.google.com/rss/search?q=%22IBM%22+network+OR+cloud+OR+telecom+OR+red+hat+OR+infrastructure+when:7d", source: "IBM" },
  { url: "https://news.google.com/rss/search?q=%22Huawei%22+network+OR+5G+OR+6G+OR+router+OR+datacenter+when:7d", source: "Huawei" },
  { url: "https://news.google.com/rss/search?q=%22Tencent%22+network+OR+cloud+OR+datacenter+OR+infrastructure+when:7d", source: "Tencent" },
  { url: "https://news.google.com/rss/search?q=%22Alibaba%22+network+OR+cloud+OR+datacenter+OR+infrastructure+when:7d", source: "Alibaba" },
  { url: "https://news.google.com/rss/search?q=%22Baidu%22+network+OR+cloud+OR+infrastructure+when:7d", source: "Baidu" },
  { url: "https://news.google.com/rss/search?q=%22ByteDance%22+network+OR+cloud+OR+infrastructure+OR+streaming+when:7d", source: "ByteDance" },
];

function parseRSSXml(xml: string, source: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link") || extractGuid(block);
    const description = extractTag(block, "description");
    const pubDate = extractTag(block, "pubDate");
    if (title && link) {
      const cleanTitle = decodeEntities(title);
      const cleanSnippet = decodeEntities(stripHtml(description || "")).slice(0, 200);
      items.push({
        title: cleanTitle,
        link,
        snippet: cleanSnippet,
        source,
        pubDate: pubDate || null,
        companies: inferCompanies(`${cleanTitle} ${cleanSnippet}`),
      });
    }
  }
  return items;
}

function extractTag(xml: string, tag: string): string {
  const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i"));
  if (cdataMatch) return cdataMatch[1].trim();
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function extractGuid(xml: string): string {
  const match = xml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
  return match ? match[1].trim() : "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function decodeEntities(text: string): string {
  return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/&#x2F;/g, "/");
}


export async function syncAllFeeds(): Promise<FeedStat[]> {
  const limit = 500;
  const stats: FeedStat[] = [];
  const allItems: RSSItem[] = [];

  // Fetch all feeds
  const results = await Promise.allSettled(
    NEWS_FEEDS.map(async (feed) => {
      try {
        const res = await fetch(feed.url, { signal: AbortSignal.timeout(12000) });
        if (!res.ok) { stats.push({ source: feed.source, status: "error", count: 0, error: `HTTP ${res.status}` }); return []; }
        const text = await res.text();
        if (!text.includes("<item>") && !text.includes("<entry>")) {
          stats.push({ source: feed.source, status: "error", count: 0, error: "not RSS/XML" });
          return [];
        }
        const parsed = parseRSSXml(text, feed.source);
        stats.push({ source: feed.source, status: "ok", count: parsed.length });
        return parsed;
      } catch (err) {
        stats.push({ source: feed.source, status: "error", count: 0, error: err instanceof Error ? err.message : "unknown" });
        return [];
      }
    }),
  );

  for (const r of results) {
    if (r.status === "fulfilled") allItems.push(...r.value);
  }

  // Global dedup by link
  const seen = new Set<string>();
  const deduped = allItems.filter((i) => {
    if (seen.has(i.link)) return false;
    seen.add(i.link);
    return true;
  }).slice(0, limit);

  // AI quality filter — rates relevance 1-10, discards fluff
  console.log(`[feeds] Quality filtering ${deduped.length} items...`);
  const { keep, scores } = filterQuality(deduped.map(i => ({ title: i.title, snippet: i.snippet })));
  const filtered = deduped.filter((_, i) => keep[i]);
  const discarded = deduped.length - filtered.length;
  if (discarded > 0) console.log(`[feeds] Discarded ${discarded} low-quality items`);

  // Insert into DB with relevance score
  let totalInserted = 0;
  for (let i = 0; i < filtered.length; i++) {
    const item = filtered[i];
    const origIdx = deduped.indexOf(item);
    const score = origIdx >= 0 ? scores[origIdx] ?? 5 : 5;

    const { data: existing } = await supabase
      .from("news_items").select("id").eq("link", item.link).maybeSingle();
    if (!existing) {
      await supabase.from("news_items").insert({
        title: item.title, link: item.link, snippet: item.snippet,
        source: item.source, category: "news",
        pub_date: item.pubDate, companies: item.companies,
        relevance_score: score,
      });
      totalInserted++;
    }
  }

  await supabase.from("sync_meta").upsert(
    { entity: "news", last_sync_at: new Date().toISOString(), last_result: { feedStats: stats } },
    { onConflict: "entity" },
  );

  return stats;
}
