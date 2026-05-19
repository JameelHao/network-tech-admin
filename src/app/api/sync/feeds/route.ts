import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { fetchRSSItemsWithStats, getNewsFeeds, getJobsFeeds } from "@/lib/admin/rss";
import type { FeedStat } from "@/lib/admin/rss";

export const dynamic = "force-dynamic";

export async function POST() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const supabase = await createClient();

  const [newsResult, jobsResult] = await Promise.all([
    fetchRSSItemsWithStats(getNewsFeeds(), 30),
    fetchRSSItemsWithStats(getJobsFeeds(), 20),
  ]);

  const allRows = [
    ...newsResult.items.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: item.source,
      pub_date: item.pubDate || null,
      category: "news" as const,
      companies: item.companies,
    })),
    ...jobsResult.items.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: item.source,
      pub_date: item.pubDate || null,
      category: "job" as const,
      companies: item.companies,
    })),
  ];

  const { error } = allRows.length > 0
    ? await supabase.from("news_items").upsert(allRows, { onConflict: "link", ignoreDuplicates: true })
    : { error: null };

  const feedStats: FeedStat[] = [...newsResult.feedStats, ...jobsResult.feedStats];
  const now = new Date().toISOString();

  await Promise.all([
    supabase.from("sync_meta").upsert({ entity: "news", last_sync_at: now, last_result: { feedStats: newsResult.feedStats } }, { onConflict: "entity" }),
    supabase.from("sync_meta").upsert({ entity: "jobs", last_sync_at: now, last_result: { feedStats: jobsResult.feedStats } }, { onConflict: "entity" }),
  ]);

  return NextResponse.json({
    success: !error,
    news: newsResult.items.length,
    jobs: jobsResult.items.length,
    feedStats,
    error: error?.message ?? null,
  });
}
