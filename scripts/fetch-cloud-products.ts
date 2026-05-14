#!/usr/bin/env npx tsx

import * as https from "https";
import * as http from "http";
import {
  FEEDS,
  parseItems,
  matchesNetworking,
  mapTopics,
  truncate,
  type FeedConfig,
} from "../src/lib/admin/cloud-feeds";

export {
  extractTag,
  cleanHTML,
  parseItems,
  matchesNetworking,
  mapTopics,
  FEEDS,
  TOPIC_KEYWORDS,
} from "../src/lib/admin/cloud-feeds";

type CloudProduct = {
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
