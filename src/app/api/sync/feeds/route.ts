import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchRSSItems, getNewsFeeds, getJobsFeeds } from "@/lib/admin/rss";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();

  const [newsItems, jobItems] = await Promise.all([
    fetchRSSItems(getNewsFeeds(), 30),
    fetchRSSItems(getJobsFeeds(), 20),
  ]);

  const allRows = [
    ...newsItems.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: item.source,
      pub_date: item.pubDate || null,
      category: "news" as const,
    })),
    ...jobItems.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: item.source,
      pub_date: item.pubDate || null,
      category: "job" as const,
    })),
  ];

  const { error } = await supabase
    .from("news_items")
    .upsert(allRows, { onConflict: "link", ignoreDuplicates: true });

  return NextResponse.json({
    success: !error,
    news: newsItems.length,
    jobs: jobItems.length,
    error: error?.message,
  });
}
