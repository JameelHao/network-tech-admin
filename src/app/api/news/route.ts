import { createClient } from "@/lib/supabase/server";
import { fetchRSSItems, getNewsFeeds } from "@/lib/admin/rss";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
    const pageSize = [25, 50, 100].includes(parseInt(sp.get("size") ?? "", 10))
      ? parseInt(sp.get("size")!, 10)
      : 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = await createClient();
    const { data, count } = await supabase
      .from("news_items")
      .select("*", { count: "exact" })
      .eq("category", "news")
      .order("pub_date", { ascending: false })
      .range(from, to);

    if (data && data.length > 0) {
      const total = count ?? 0;
      const items = data.map((d) => ({
        title: d.title,
        link: d.link,
        snippet: d.snippet,
        source: d.source,
        pubDate: d.pub_date,
      }));
      return NextResponse.json({
        items,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        fromCache: true,
      });
    }

    const items = await fetchRSSItems(getNewsFeeds(), 20);
    return NextResponse.json({ items, total: items.length, page: 1, pageSize: items.length, totalPages: 1, fromCache: false });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 1, error: msg }, { status: 500 });
  }
}
