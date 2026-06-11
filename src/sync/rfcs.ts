import { supabase } from "../lib/supabase.js";
import type { FeedStat } from "../types/index.js";

const RFC_FEEDS = [
  { name: "Internet-Drafts", url: "https://www.rfc-editor.org/rss/rfc.xml" },
];

export async function syncRFCs(): Promise<FeedStat[]> {
  const stats: FeedStat[] = [];

  for (const feed of RFC_FEEDS) {
    try {
      const res = await fetch(feed.url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) { stats.push({ source: feed.name, status: "error", count: 0, error: `HTTP ${res.status}` }); continue; }
      const xml = await res.text();
      const entries = xml.split("<entry>").slice(1);
      let inserted = 0;

      for (const entry of entries) {
        const title = extractTag(entry, "title")?.trim();
        const idMatch = title?.match(/RFC\s*(\d+)/i);
        if (!idMatch) continue;
        const rfcNumber = parseInt(idMatch[1], 10);
        const summary = extractTag(entry, "summary")?.trim() || null;
        const updated = extractTag(entry, "updated")?.trim() || null;
        const link = extractRfcLink(entry);

        const { data: existing } = await supabase
          .from("rfcs").select("id").eq("rfc_number", rfcNumber).maybeSingle();
        if (!existing) {
          await supabase.from("rfcs").insert({
            rfc_number: rfcNumber,
            title: title,
            summary: summary,
            published_date: updated ? updated.slice(0, 10) : null,
            url: link,
            is_draft: false,
          });
          inserted++;
        }
      }
      stats.push({ source: feed.name, status: "ok", count: inserted });
    } catch (err) {
      stats.push({ source: feed.name, status: "error", count: 0, error: err instanceof Error ? err.message : "unknown" });
    }
  }

  await supabase.from("sync_meta").upsert(
    { entity: "rfcs", last_sync_at: new Date().toISOString(), last_result: { feedStats: stats } },
    { onConflict: "entity" },
  );

  return stats;
}

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

function extractRfcLink(xml: string): string {
  const m = xml.match(/<link[^>]*href="([^"]+)"/);
  return m ? m[1] : "";
}
