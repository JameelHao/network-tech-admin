import { createClient } from "@/lib/supabase/server";
import { fetchRSSItems, getNewsFeeds } from "@/lib/admin/rss";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("news_items")
      .select("*")
      .eq("category", "news")
      .order("pub_date", { ascending: false })
      .limit(20);

    if (data && data.length > 0) {
      const items = data.map((d) => ({
        title: d.title,
        link: d.link,
        snippet: d.snippet,
        source: d.source,
        pubDate: d.pub_date,
      }));
      return NextResponse.json({ items, fromCache: true });
    }

    const items = await fetchRSSItems(getNewsFeeds(), 20);
    return NextResponse.json({ items, fromCache: false });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ items: [], error: msg }, { status: 500 });
  }
}
