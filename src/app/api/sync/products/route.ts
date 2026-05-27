import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { upsertCloudProducts, type CloudProductInput } from "@/lib/admin/products";
import { fetchRSSItems } from "@/lib/admin/rss";
import {
  FEEDS,
  parseItems,
  matchesNetworking,
  mapTopics,
  truncate,
  type FeedConfig,
} from "@/lib/admin/cloud-feeds";

export const dynamic = "force-dynamic";

const GITHUB_RE = /github\.com\/([^/]+)\/([^/]+)/;
const TIMEOUT_MS = 10_000;
const FEED_TIMEOUT_MS = 8_000;

type SyncStat = { name: string; status: "ok" | "error" | "skipped"; version?: string; error?: string };

// ---- GitHub release checker (old products logic) ----

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function checkGitHubRelease(owner: string, repo: string): Promise<{ version: string; date: string } | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetchWithTimeout(url, TIMEOUT_MS);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    version: (data.tag_name as string)?.replace(/^v/, "") ?? "",
    date: data.published_at ? new Date(data.published_at as string).toISOString().split("T")[0] : "",
  };
}

async function syncTrackedProducts(): Promise<{ updated: number; stats: SyncStat[] }> {
  const supabase = await createClient();
  const { data: products, error: fetchError } = await supabase
    .from("products")
    .select("id, name, url, changelog_url, latest_version")
    .or("url.neq.null,changelog_url.neq.null");

  if (fetchError || !products || products.length === 0) {
    return { updated: 0, stats: [] };
  }

  let updated = 0;
  const stats: SyncStat[] = [];

  const tasks = products.map(async (p) => {
    const ghMatch = p.url?.match(GITHUB_RE);

    if (ghMatch) {
      try {
        const release = await checkGitHubRelease(ghMatch[1], ghMatch[2]);
        if (release && release.version && release.version !== p.latest_version) {
          await supabase.from("products").update({
            latest_version: release.version,
            release_date: release.date || null,
            updated_at: new Date().toISOString(),
          }).eq("id", p.id);
          updated++;
          stats.push({ name: p.name, status: "ok", version: release.version });
        } else {
          stats.push({ name: p.name, status: "ok", version: p.latest_version ?? undefined });
        }
      } catch (e) {
        stats.push({ name: p.name, status: "error", error: e instanceof Error ? e.message : "Unknown error" });
      }
      return;
    }

    if (p.changelog_url) {
      try {
        const items = await fetchRSSItems([{ url: p.changelog_url, source: p.name }], 1);
        if (items.length > 0) {
          const latest = items[0];
          const version = latest.title?.replace(/^v/, "").trim() || null;
          const date = latest.pubDate ? new Date(latest.pubDate).toISOString().split("T")[0] : null;
          if (version && version !== p.latest_version) {
            await supabase.from("products").update({
              latest_version: version,
              release_date: date,
              updated_at: new Date().toISOString(),
            }).eq("id", p.id);
            updated++;
            stats.push({ name: p.name, status: "ok", version });
          } else {
            stats.push({ name: p.name, status: "ok", version: p.latest_version ?? undefined });
          }
        } else {
          stats.push({ name: p.name, status: "skipped" });
        }
      } catch (e) {
        stats.push({ name: p.name, status: "error", error: e instanceof Error ? e.message : "Unknown error" });
      }
      return;
    }

    stats.push({ name: p.name, status: "skipped" });
  });

  await Promise.all(tasks);
  return { updated, stats };
}

// ---- Cloud feed fetcher (cloud-products logic) ----

type ProviderResult = { vendor: string; status: "ok" | "error"; count: number; error?: string };

async function fetchFeed(feed: FeedConfig): Promise<{ items: CloudProductInput[]; error?: string }> {
  const tag = `[cloud-sync:${feed.vendor}]`;
  try {
    console.log(`${tag} fetching ${feed.url}`);
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
      url: feed.site_url ?? item.link,
      pricing: "paid",
      topics: mapTopics(item),
      source_url: item.link,
      published_at: new Date(item.pubDate).toISOString(),
    }));

    console.log(`${tag} ${items.length} networking items`);
    return { items };
  } catch (err) {
    const msg = (err as Error).message;
    console.log(`${tag} ERROR: ${msg}`);
    return { items: [], error: msg };
  }
}

async function syncCloudFeeds(): Promise<{ inserted: number; updated: number; results: ProviderResult[] }> {
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

  return { inserted, updated, results };
}

// ---- Combined POST handler ----

export async function POST() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const [ghResult, cloudResult] = await Promise.all([
    syncTrackedProducts(),
    syncCloudFeeds(),
  ]);

  const supabase = await createClient();
  const now = new Date().toISOString();
  await supabase.from("sync_meta").upsert(
    { entity: "products", last_sync_at: now, last_result: { updated: ghResult.updated, stats: ghResult.stats } },
    { onConflict: "entity" },
  );
  await supabase.from("sync_meta").upsert(
    { entity: "cloud-products", last_sync_at: now, last_result: { results: cloudResult.results, inserted: cloudResult.inserted, updated: cloudResult.updated } },
    { onConflict: "entity" },
  );

  const allStats = [
    ...ghResult.stats,
    ...cloudResult.results.map((r) => ({ name: r.vendor, status: r.status, error: r.error })),
  ];
  const totalUpdated = ghResult.updated + cloudResult.inserted + cloudResult.updated;

  console.log(`[products-sync] done: ${totalUpdated} total updates, ${ghResult.stats.length} products checked, ${cloudResult.results.length} cloud feeds`);

  return NextResponse.json({
    success: true,
    stats: allStats,
    updated: totalUpdated,
    ghUpdated: ghResult.updated,
    ghChecked: ghResult.stats.length,
    cloudInserted: cloudResult.inserted,
    cloudUpdated: cloudResult.updated,
  });
}
