export type RSSItem = {
  title: string;
  link: string;
  snippet: string;
  source: string;
  pubDate: string | null;
};

const NEWS_FEEDS = [
  { url: "https://hnrss.org/newest?q=networking+OR+SDN+OR+datacenter+OR+BGP+OR+eBPF", source: "Hacker News" },
  { url: "https://www.sdxcentral.com/feed/", source: "SDxCentral" },
  { url: "https://blog.cloudflare.com/rss/", source: "Cloudflare Blog" },
  { url: "https://feeds.arstechnica.com/arstechnica/technology-lab", source: "Ars Technica" },
  { url: "https://www.theregister.com/headlines.rss", source: "The Register" },
];

const JOBS_FEEDS = [
  { url: "https://hnrss.org/jobs?q=network+OR+networking+OR+infrastructure+OR+SDN+OR+cloud", source: "HN Jobs" },
  { url: "https://www.indeed.com/rss?q=network+engineer+SDN&sort=date", source: "Indeed" },
  { url: "https://stackoverflow.com/jobs/feed?q=network+engineer&sort=p", source: "Stack Overflow" },
];

export async function fetchRSSItems(feeds: { url: string; source: string }[], limit = 20): Promise<RSSItem[]> {
  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const res = await fetch(feed.url, {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      const xml = await res.text();
      return parseRSSXml(xml, feed.source);
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
  return items.filter((item) => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  }).slice(0, limit);
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
