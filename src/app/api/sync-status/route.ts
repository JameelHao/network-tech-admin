import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SourceStatus = { lastSync: string | null; count: number };

export async function GET() {
  const supabase = await createClient();

  const [papersRes, newsRes, jobsRes, productsRes, opensourceRes, cloudProductsRes, syncMetaRes] = await Promise.all([
    supabase.from("papers").select("created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("news_items").select("created_at").eq("category", "news").order("created_at", { ascending: false }).limit(1),
    supabase.from("news_items").select("created_at").eq("category", "job").order("created_at", { ascending: false }).limit(1),
    supabase.from("products").select("updated_at").order("updated_at", { ascending: false }).limit(1),
    supabase.from("opensource").select("created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("products").select("updated_at").eq("source", "cloud-releases").order("updated_at", { ascending: false }).limit(1),
    supabase.from("sync_meta").select("entity, last_sync_at").in("entity", ["papers", "news", "jobs", "products", "opensource", "cloud-products"]),
  ]);

  const [papersCount, newsCount, jobsCount, productsCount, opensourceCount, cloudProductsCount] = await Promise.all([
    supabase.from("papers").select("*", { count: "exact", head: true }),
    supabase.from("news_items").select("*", { count: "exact", head: true }).eq("category", "news"),
    supabase.from("news_items").select("*", { count: "exact", head: true }).eq("category", "job"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("opensource").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("source", "cloud-releases"),
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
    jobs: {
      lastSync: syncMeta.jobs ?? jobsRes.data?.[0]?.created_at ?? null,
      count: jobsCount.count ?? 0,
    },
    products: {
      lastSync: syncMeta.products ?? productsRes.data?.[0]?.updated_at ?? null,
      count: productsCount.count ?? 0,
    },
    opensource: {
      lastSync: syncMeta.opensource ?? opensourceRes.data?.[0]?.created_at ?? null,
      count: opensourceCount.count ?? 0,
    },
    "cloud-products": {
      lastSync: syncMeta["cloud-products"] ?? cloudProductsRes.data?.[0]?.updated_at ?? null,
      count: cloudProductsCount.count ?? 0,
    },
  };

  return NextResponse.json(result);
}
