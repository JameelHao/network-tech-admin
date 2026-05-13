import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAllNetworkPapers } from "@/lib/admin/paper-import";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { papers: fetched, categoryStats } = await fetchAllNetworkPapers(2026);

  await supabase.from("sync_meta").upsert(
    { entity: "papers", last_sync_at: new Date().toISOString(), last_result: { categoryStats } },
    { onConflict: "entity" },
  );

  if (fetched.length === 0) {
    return NextResponse.json({ imported: 0, message: "No papers found", categoryStats });
  }

  const { data: existing } = await supabase.from("papers").select("title");
  const existingTitles = new Set((existing ?? []).map((p) => p.title.toLowerCase()));
  const newPapers = fetched.filter((p) => !existingTitles.has(p.title.toLowerCase()));

  let imported = 0;
  for (let i = 0; i < newPapers.length; i += 50) {
    const batch = newPapers.slice(i, i + 50).map((p) => ({
      title: p.title,
      authors: p.authors,
      venue: p.venue,
      url: p.url,
      published_date: p.published_date,
      abstract: p.abstract,
      topics: p.topics,
    }));
    const { error } = await supabase.from("papers").insert(batch);
    if (!error) imported += batch.length;
  }

  return NextResponse.json({
    imported,
    total_fetched: fetched.length,
    already_existed: fetched.length - newPapers.length,
    categoryStats,
  });
}
