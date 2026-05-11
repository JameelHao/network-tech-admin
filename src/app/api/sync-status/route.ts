import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SourceStatus = { lastSync: string | null; count: number };

export async function GET() {
  const supabase = await createClient();

  const [papersRes, newsRes, jobsRes] = await Promise.all([
    supabase.from("papers").select("created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("news_items").select("created_at").eq("category", "news").order("created_at", { ascending: false }).limit(1),
    supabase.from("news_items").select("created_at").eq("category", "job").order("created_at", { ascending: false }).limit(1),
  ]);

  const [papersCount, newsCount, jobsCount] = await Promise.all([
    supabase.from("papers").select("*", { count: "exact", head: true }),
    supabase.from("news_items").select("*", { count: "exact", head: true }).eq("category", "news"),
    supabase.from("news_items").select("*", { count: "exact", head: true }).eq("category", "job"),
  ]);

  const result: Record<string, SourceStatus> = {
    papers: {
      lastSync: papersRes.data?.[0]?.created_at ?? null,
      count: papersCount.count ?? 0,
    },
    news: {
      lastSync: newsRes.data?.[0]?.created_at ?? null,
      count: newsCount.count ?? 0,
    },
    jobs: {
      lastSync: jobsRes.data?.[0]?.created_at ?? null,
      count: jobsCount.count ?? 0,
    },
  };

  return NextResponse.json(result);
}
