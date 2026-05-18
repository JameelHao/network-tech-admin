import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { upsertCloudProducts, type CloudProductInput } from "@/lib/admin/products";
import {
  FEEDS,
  parseItems,
  matchesNetworking,
  mapTopics,
  truncate,
  type FeedConfig,
} from "@/lib/admin/cloud-feeds";

export const dynamic = "force-dynamic";

const FEED_TIMEOUT_MS = 8_000;

type ProviderResult = {
  vendor: string;
  status: "ok" | "error";
  count: number;
  error?: string;
};

async function fetchFeed(feed: FeedConfig): Promise<{ items: CloudProductInput[]; error?: string }> {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CloudProductsBot/1.0)" },
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    });

    if (!res.ok) return { items: [], error: `HTTP ${res.status}` };

    const xml = await res.text();
    const parsed = parseItems(xml);
    const filtered = parsed.filter((item) => matchesNetworking(item, feed.keywords));

    const items: CloudProductInput[] = filtered.map((item) => ({
      name: truncate(item.title, 200),
      vendor: feed.vendor,
      category: feed.category,
      description: truncate(item.description, 200),
      url: item.link,
      pricing: "paid",
      topics: mapTopics(item),
      source_url: item.link,
      published_at: new Date(item.pubDate).toISOString(),
    }));

    return { items };
  } catch (err) {
    return { items: [], error: (err as Error).message };
  }
}

export async function POST() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const results: ProviderResult[] = [];
  const allItems: CloudProductInput[] = [];

  const feedResults = await Promise.all(FEEDS.map((feed) => fetchFeed(feed)));

  for (let i = 0; i < FEEDS.length; i++) {
    const { items, error } = feedResults[i];
    if (error) {
      results.push({ vendor: FEEDS[i].vendor, status: "error", count: 0, error });
    } else {
      results.push({ vendor: FEEDS[i].vendor, status: "ok", count: items.length });
      allItems.push(...items);
    }
  }

  // Deduplicate by source_url
  const seen = new Set<string>();
  const unique = allItems.filter((p) => {
    if (!p.source_url || seen.has(p.source_url)) return false;
    seen.add(p.source_url);
    return true;
  });

  const { inserted, updated } = await upsertCloudProducts(unique);

  const supabase = await createClient();
  await supabase.from("sync_meta").upsert(
    { entity: "cloud-products", last_sync_at: new Date().toISOString(), last_result: { results, inserted, updated } },
    { onConflict: "entity" },
  );

  return NextResponse.json({
    success: true,
    providers: results,
    total: unique.length,
    inserted,
    updated,
  });
}
