#!/usr/bin/env npx tsx

import * as https from "https";
import * as http from "http";

// ── Types ──────────────────────────────────────────────────────────

export type CloudProduct = {
  name: string;
  vendor: string;
  category: "saas" | "platform" | "tool";
  description: string;
  url: string;
  pricing: "paid";
  topics: string[];
  source: "cloud-releases";
  publishedAt: string;
};

type FeedItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

type FeedConfig = {
  url: string;
  vendor: string;
  category: "saas" | "platform" | "tool";
  // empty array = keep all items (no filtering)
  keywords: string[];
};

// ── Feed configuration ─────────────────────────────────────────────

export const FEEDS: FeedConfig[] = [
  {
    url: "https://aws.amazon.com/about-aws/whats-new/recent/feed/",
    vendor: "aws",
    category: "platform",
    keywords: [
      "network", "vpc", "cdn", "cloudfront", "load balancer", "gateway",
      "transit", "route53", "route 53", "direct connect", "global accelerator",
      "elastic ip", "privatelink", "elb", "alb", "nlb",
    ],
  },
  {
    url: "https://azurecomcdn.azureedge.net/en-us/updates/feed/",
    vendor: "azure",
    category: "platform",
    keywords: [
      "network", "vnet", "cdn", "front door", "load balancer", "expressroute",
      "firewall", "waf", "application gateway", "traffic manager", "private link",
      "ddos", "dns", "vpn",
    ],
  },
  {
    url: "https://cloud.google.com/feeds/gcp-release-notes.xml",
    vendor: "gcp",
    category: "platform",
    keywords: [
      "network", "vpc", "cdn", "cloud armor", "load balancing", "interconnect",
      "cloud dns", "cloud nat", "cloud vpn", "cloud router", "network service tiers",
    ],
  },
  {
    url: "https://blog.cloudflare.com/rss/",
    vendor: "cloudflare",
    category: "saas",
    keywords: [],
  },
];

// ── Topic mapping ──────────────────────────────────────────────────

export const TOPIC_KEYWORDS: [RegExp, string][] = [
  [/\b(vpc|vnet|transit|private\s?link|direct\s?connect|expressroute|interconnect|cloud\s?router|network\s?service)\b/i, "cloud-infra"],
  [/\b(cdn|cloudfront|front\s?door|cloud\s?cdn|edge|cache|acceleration)\b/i, "edge-computing"],
  [/\b(load\s?balanc|elb|alb|nlb|gateway|application\s?gateway|traffic\s?manager|global\s?accelerator)\b/i, "cloud-infra"],
  [/\b(firewall|waf|shield|armor|ddos)\b/i, "ddos-defense"],
  [/\b(zero\s?trust|iam|identity|access\s?management|sase)\b/i, "zero-trust"],
  [/\b(dns|route\s?53|cloud\s?dns)\b/i, "dns-bgp"],
  [/\b(monitor\w*|observab\w*|telemetry|flow\s?log)\b/i, "network-monitoring"],
  [/\b(5g|wireless|mobile\s?network)\b/i, "5g-6g"],
  [/\b(satellite|leo|starlink)\b/i, "satellite-leo"],
  [/\b(vpn|tunnel|ipsec|wireguard)\b/i, "protocol-security"],
  [/\b(ebpf|xdp|dpdk)\b/i, "ebpf-xdp"],
  [/\b(sdn|nfv|openflow)\b/i, "sdn-nfv"],
];

// ── HTTP fetch ─────────────────────────────────────────────────────

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; CloudProductsBot/1.0)" } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const location = res.headers.location;
          if (!location) return reject(new Error("Redirect without location"));
          return httpsGet(location).then(resolve).catch(reject);
        }
        let data = "";
        res.on("data", (chunk: string) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

// ── XML parsing ────────────────────────────────────────────────────

export function extractTag(content: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = content.match(regex);
  if (match) return match[1];

  const selfClosing = new RegExp(`<${tag}[^>]*href=["']([^"']+)["']`, "i");
  const scMatch = content.match(selfClosing);
  if (scMatch) return scMatch[1];

  return "";
}

export function cleanHTML(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s+/g, " ")
    .trim();
}

export function parseItems(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/g;

  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const raw = match[1];
    const title = cleanHTML(extractTag(raw, "title"));
    if (!title) continue;

    const link = cleanHTML(extractTag(raw, "link"));
    const description = cleanHTML(
      extractTag(raw, "description") || extractTag(raw, "summary") || extractTag(raw, "content"),
    );
    const pubDate =
      extractTag(raw, "pubDate") || extractTag(raw, "published") || extractTag(raw, "updated");

    items.push({ title, link, description, pubDate: pubDate || new Date().toISOString() });
  }

  return items;
}

// ── Filtering & mapping ────────────────────────────────────────────

export function matchesNetworking(item: FeedItem, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const text = (item.title + " " + item.description).toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

export function mapTopics(item: FeedItem): string[] {
  const text = item.title + " " + item.description;
  const topics = new Set<string>();

  for (const [regex, slug] of TOPIC_KEYWORDS) {
    if (regex.test(text)) topics.add(slug);
  }

  // Default to cloud-infra if no specific topic matched
  if (topics.size === 0) topics.add("cloud-infra");

  return Array.from(topics).sort();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}

// ── Main ───────────────────────────────────────────────────────────

async function fetchFeed(feed: FeedConfig): Promise<CloudProduct[]> {
  try {
    process.stderr.write(`Fetching ${feed.vendor}...\n`);
    const xml = await httpsGet(feed.url);
    const items = parseItems(xml);
    const filtered = items.filter((item) => matchesNetworking(item, feed.keywords));

    return filtered.map((item) => ({
      name: truncate(item.title, 200),
      vendor: feed.vendor,
      category: feed.category,
      description: truncate(item.description, 200),
      url: item.link,
      pricing: "paid" as const,
      topics: mapTopics(item),
      source: "cloud-releases" as const,
      publishedAt: new Date(item.pubDate).toISOString(),
    }));
  } catch (err) {
    process.stderr.write(`Warning: failed to fetch ${feed.vendor}: ${(err as Error).message}\n`);
    return [];
  }
}

async function main() {
  process.stderr.write("Cloud Products Fetcher — Starting...\n\n");

  const all: CloudProduct[] = [];
  for (const feed of FEEDS) {
    const products = await fetchFeed(feed);
    all.push(...products);
    process.stderr.write(`  ${feed.vendor}: ${products.length} networking items\n`);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = all.filter((p) => {
    if (!p.url || seen.has(p.url)) return false;
    seen.add(p.url);
    return true;
  });

  unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  process.stderr.write(`\nTotal: ${unique.length} unique products\n`);
  console.log(JSON.stringify(unique, null, 2));
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`);
  process.exit(1);
});
