export type RSSItem = {
  title: string;
  link: string;
  snippet: string;
  source: string;
  pubDate: string | null;
};

export type FeedStat = {
  source: string;
  status: "ok" | "error";
  count: number;
  error?: string;
};

export type FetchResult = {
  items: RSSItem[];
  feedStats: FeedStat[];
};

const NEWS_FEEDS = [
  { url: "https://hnrss.org/newest?q=networking+OR+SDN+OR+datacenter+OR+BGP+OR+eBPF+OR+network+protocol", source: "Hacker News" },
  { url: "https://hnrss.org/newest?q=cloudflare+OR+AWS+networking+OR+network+infrastructure+OR+xAI+cluster+OR+colossus", source: "Hacker News" },
  { url: "https://www.sdxcentral.com/feed/", source: "SDxCentral" },
  { url: "https://blog.cloudflare.com/rss/", source: "Cloudflare Blog" },
  { url: "https://aws.amazon.com/blogs/networking-and-content-delivery/feed/", source: "AWS Networking" },
  { url: "https://feeds.arstechnica.com/arstechnica/technology-lab", source: "Ars Technica" },
  { url: "https://www.theregister.com/networks/headlines.rss", source: "The Register" },
  { url: "https://engineering.fb.com/category/networking-traffic/feed/", source: "Meta Engineering" },
  // Chinese tech feeds
  { url: "https://www.infoq.cn/feed", source: "InfoQ 中文" },
  { url: "https://www.oschina.net/news/rss", source: "开源中国" },
  { url: "https://www.freebuf.com/feed", source: "FreeBuf" },
  { url: "https://blog.cloudflare.com/zh-cn/rss/", source: "Cloudflare 中文" },
  { url: "https://lwn.net/headlines/rss", source: "LWN.net" },
];

const JOBS_FEEDS = [
  { url: "https://hnrss.org/jobs?q=network+engineer+OR+SDN+OR+datacenter+networking+OR+BGP+OR+network+infrastructure", source: "HN Jobs" },
  { url: "https://news.google.com/rss/search?q=%22network+engineer%22+Amazon+OR+AWS+when:7d&hl=en-US&gl=US&ceid=US:en", source: "Amazon/AWS" },
  { url: "https://news.google.com/rss/search?q=%22network+engineer%22+Cloudflare+when:7d&hl=en-US&gl=US&ceid=US:en", source: "Cloudflare" },
  { url: "https://news.google.com/rss/search?q=%22network+engineer%22+Google+when:7d&hl=en-US&gl=US&ceid=US:en", source: "Google" },
  { url: "https://news.google.com/rss/search?q=%22network+engineer%22+Meta+when:7d&hl=en-US&gl=US&ceid=US:en", source: "Meta" },
  { url: "https://news.google.com/rss/search?q=%22network+engineer%22+Microsoft+Azure+when:7d&hl=en-US&gl=US&ceid=US:en", source: "Microsoft" },
  { url: "https://news.google.com/rss/search?q=%22network+engineer%22+xAI+when:7d&hl=en-US&gl=US&ceid=US:en", source: "xAI" },
  { url: "https://news.google.com/rss/search?q=%22network+engineer%22+Juniper+OR+Cisco+OR+Arista+when:7d&hl=en-US&gl=US&ceid=US:en", source: "Juniper/Cisco/Arista" },
  { url: "https://remoteok.com/remote-networking-jobs.rss", source: "RemoteOK" },
];

export async function fetchRSSItems(feeds: { url: string; source: string }[], limit = 20): Promise<RSSItem[]> {
  const { items } = await fetchRSSItemsWithStats(feeds, limit);
  return items;
}

export async function fetchRSSItemsWithStats(feeds: { url: string; source: string }[], limit = 20): Promise<FetchResult> {
  const feedStats: FeedStat[] = [];

  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      try {
        const res = await fetch(feed.url, {
          next: { revalidate: 0 },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) {
          feedStats.push({ source: feed.source, status: "error", count: 0, error: `HTTP ${res.status}` });
          return [];
        }
        const text = await res.text();
        if (!text.includes("<item>") && !text.includes("<entry>")) {
          feedStats.push({ source: feed.source, status: "error", count: 0, error: "not RSS/XML" });
          return [];
        }
        const parsed = parseRSSXml(text, feed.source);
        feedStats.push({ source: feed.source, status: "ok", count: parsed.length });
        return parsed;
      } catch (err) {
        feedStats.push({ source: feed.source, status: "error", count: 0, error: err instanceof Error ? err.message : "unknown" });
        return [];
      }
    })
  );

  const items: RSSItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value);
  }

  items.sort((a, b) => {
    if (!a.pubDate) return 1;
    if (!b.pubDate) return -1;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  const seen = new Set<string>();
  const deduped = items.filter((item) => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  }).slice(0, limit);

  return { items: deduped, feedStats };
}

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
      items.push({
        title: decodeEntities(title),
        link,
        snippet: decodeEntities(stripHtml(description || "")).slice(0, 200),
        source,
        pubDate: pubDate || null,
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
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

export function getNewsFeeds() { return NEWS_FEEDS; }
export function getJobsFeeds() { return JOBS_FEEDS; }
