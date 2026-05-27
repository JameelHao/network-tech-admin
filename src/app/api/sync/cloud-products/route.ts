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
  const tag = `[cloud-sync:${feed.vendor}]`;
  try {
    console.log(`${tag} fetching ${feed.url}`);
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CloudProductsBot/1.0)" },
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    });
    console.log(`${tag} HTTP ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.log(`${tag} response body (${body.length} chars): ${body.slice(0, 200)}`);
      return { items: [], error: `HTTP ${res.status} ${res.statusText}` };
    }

    const xml = await res.text();
    console.log(`${tag} body ${xml.length} bytes, first 200: ${xml.slice(0, 200)}`);

    const parsed = parseItems(xml);
    console.log(`${tag} parsed ${parsed.length} raw items`);

    const filtered = parsed.filter((item) => matchesNetworking(item, feed.keywords));
    console.log(`${tag} ${filtered.length} networking items`);

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
    const msg = (err as Error).message;
    console.log(`${tag} ERROR: ${msg}`);
    return { items: [], error: msg };
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

  let inserted = 0;
  let updated = 0;
  try {
    const result = await upsertCloudProducts(unique);
    inserted = result.inserted;
    updated = result.updated;
  } catch (e) {
    console.log(`[cloud-sync] upsert ERROR: ${(e as Error).message}`);
  }

  const supabase = await createClient();
  await supabase.from("sync_meta").upsert(
    { entity: "cloud-products", last_sync_at: new Date().toISOString(), last_result: { results, inserted, updated } },
    { onConflict: "entity" },
  );

  console.log(`[cloud-sync] done: ${unique.length} unique, ${inserted} inserted, ${updated} updated`);

  return NextResponse.json({
    success: true,
    providers: results,
    stats: results.map((r) => ({ name: r.vendor, status: r.status, error: r.error })),
    total: unique.length,
    inserted,
    updated,
  });
}
