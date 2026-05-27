import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { upsertRfcs } from "@/lib/admin/rfcs";
import { inferCompanies } from "@/lib/admin/companies";
import { mapTopics, cleanHTML, extractTag, truncate } from "@/lib/admin/cloud-feeds";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RFC_FEED = "https://datatracker.ietf.org/feed/rfc/";

type FeedItem = {
  rfc_number: number;
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

function parseRFCItems(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const raw = match[1];
    const title = cleanHTML(extractTag(raw, "title"));
    if (!title) continue;

    const numMatch = title.match(/^rfc(\d+)\s*:/i);
    if (!numMatch) continue;
    const rfc_number = parseInt(numMatch[1], 10);

    const link = cleanHTML(extractTag(raw, "link"));
    const description = cleanHTML(extractTag(raw, "description"));
    const pubDate = extractTag(raw, "pubDate");

    items.push({ rfc_number, title, link, description, pubDate: pubDate || new Date().toISOString() });
  }

  return items;
}

export async function POST() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const res = await fetch(RFC_FEED, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; RFCBot/1.0)" },
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    return NextResponse.json({ success: false, error: `HTTP ${res.status}` }, { status: 502 });
  }

  const xml = await res.text();
  const parsed = parseRFCItems(xml);

  const items = parsed.map((item) => ({
    rfc_number: item.rfc_number,
    title: truncate(item.title.replace(/^rfc\d+\s*:\s*/i, "").trim(), 300),
    abstract: truncate(item.description, 1000),
    url: item.link,
    published_at: new Date(item.pubDate).toISOString(),
    topics: mapTopics({ title: item.title, description: item.description, link: item.link, pubDate: item.pubDate }),
    companies: inferCompanies(`${item.title} ${item.description}`),
  }));

  const result = await upsertRfcs(items);

  const supabase = await createClient();
  const now = new Date().toISOString();
  await supabase.from("sync_meta").upsert(
    { entity: "rfcs", last_sync_at: now, last_result: { inserted: result.inserted, updated: result.updated, total: items.length } },
    { onConflict: "entity" },
  );

  return NextResponse.json({ success: true, ...result, total: items.length });
}
