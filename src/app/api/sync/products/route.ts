import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchRSSItems } from "@/lib/admin/rss";

export const dynamic = "force-dynamic";

const GITHUB_RE = /github\.com\/([^/]+)\/([^/]+)/;
const TIMEOUT_MS = 10_000;

type SyncStat = { name: string; status: "ok" | "error" | "skipped"; version?: string; error?: string };

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

export async function POST() {
  const supabase = await createClient();
  const { data: products, error: fetchError } = await supabase
    .from("products")
    .select("id, name, url, changelog_url, latest_version")
    .or("url.neq.null,changelog_url.neq.null");

  if (fetchError) {
    return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
  }
  if (!products || products.length === 0) {
    return NextResponse.json({ success: true, updated: 0, checked: 0, stats: [] });
  }

  let updated = 0;
  const stats: SyncStat[] = [];

  const tasks = products.map(async (p) => {
    const ghMatch = p.url?.match(GITHUB_RE);

    // GitHub release check
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

    // Changelog RSS check
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

  const now = new Date().toISOString();
  await supabase.from("sync_meta").upsert(
    { entity: "products", last_sync_at: now, last_result: { updated, stats } },
    { onConflict: "entity" },
  );

  return NextResponse.json({ success: true, updated, checked: products.length, stats });
}
