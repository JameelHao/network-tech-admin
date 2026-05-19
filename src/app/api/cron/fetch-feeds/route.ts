import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchRSSItems, getNewsFeeds, getJobsFeeds } from "@/lib/admin/rss";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const [newsItems, jobItems] = await Promise.all([
    fetchRSSItems(getNewsFeeds(), 30),
    fetchRSSItems(getJobsFeeds(), 20),
  ]);

  const newsRows = newsItems.map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    source: item.source,
    pub_date: item.pubDate || null,
    category: "news" as const,
    companies: item.companies,
  }));

  const jobRows = jobItems.map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    source: item.source,
    pub_date: item.pubDate || null,
    category: "job" as const,
    companies: item.companies,
  }));

  const allRows = [...newsRows, ...jobRows];

  const { error } = await supabase
    .from("news_items")
    .upsert(allRows, { onConflict: "link", ignoreDuplicates: true });

  return NextResponse.json({
    success: !error,
    news: newsRows.length,
    jobs: jobRows.length,
    error: error?.message,
  });
}
