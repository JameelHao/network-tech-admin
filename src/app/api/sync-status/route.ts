import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SourceStatus = { lastSync: string | null; count: number };

export async function GET() {
  const supabase = await createClient();

  const [papersRes, newsRes, opensourceRes, rfcsRes, syncMetaRes] = await Promise.all([
    supabase.from("papers").select("created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("news_items").select("created_at").eq("category", "news").order("created_at", { ascending: false }).limit(1),
    supabase.from("opensource").select("created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("rfcs").select("created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("sync_meta").select("entity, last_sync_at").in("entity", ["papers", "news", "opensource", "rfcs"]),
  ]);

  const [papersCount, newsCount, opensourceCount, rfcsCount] = await Promise.all([
    supabase.from("papers").select("*", { count: "exact", head: true }),
    supabase.from("news_items").select("*", { count: "exact", head: true }).eq("category", "news"),
    supabase.from("opensource").select("*", { count: "exact", head: true }),
    supabase.from("rfcs").select("*", { count: "exact", head: true }),
  ]);

  const syncMeta: Record<string, string | null> = {};
  for (const row of syncMetaRes.data ?? []) {
    syncMeta[row.entity] = row.last_sync_at;
  }

  const result: Record<string, SourceStatus> = {
    papers: {
      lastSync: syncMeta.papers ?? papersRes.data?.[0]?.created_at ?? null,
      count: papersCount.count ?? 0,
    },
    news: {
      lastSync: syncMeta.news ?? newsRes.data?.[0]?.created_at ?? null,
      count: newsCount.count ?? 0,
    },
    opensource: {
      lastSync: syncMeta.opensource ?? opensourceRes.data?.[0]?.created_at ?? null,
      count: opensourceCount.count ?? 0,
    },
    rfcs: {
      lastSync: syncMeta.rfcs ?? rfcsRes.data?.[0]?.created_at ?? null,
      count: rfcsCount.count ?? 0,
    },
  };

  return NextResponse.json(result);
}
