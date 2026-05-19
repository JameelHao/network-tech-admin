import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchSingleArxivCategory,
  fetchSingleS2Venue,
  ARXIV_CATEGORIES,
  S2_VENUES,
} from "@/lib/admin/paper-import";
import type { CategoryStat, ImportedPaper } from "@/lib/admin/paper-import";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const allPapers: ImportedPaper[] = [];
  const categoryStats: CategoryStat[] = [];

  for (const cat of ARXIV_CATEGORIES) {
    const result = await fetchSingleArxivCategory(cat, 2026, 5);
    allPapers.push(...result.papers);
    categoryStats.push(...result.categoryStats);
  }

  for (const venue of S2_VENUES) {
    const result = await fetchSingleS2Venue(venue, 2026, 5);
    allPapers.push(...result.papers);
    categoryStats.push(...result.categoryStats);
  }

  await supabase.from("sync_meta").upsert(
    { entity: "papers", last_sync_at: new Date().toISOString(), last_result: { categoryStats } },
    { onConflict: "entity" },
  );

  if (allPapers.length === 0) {
    return NextResponse.json({ imported: 0, message: "No papers found", categoryStats });
  }

  const { data: existing } = await supabase.from("papers").select("title");
  const existingTitles = new Set((existing ?? []).map((p) => p.title.toLowerCase()));
  const newPapers = allPapers.filter((p) => !existingTitles.has(p.title.toLowerCase()));

  let imported = 0;
  for (let i = 0; i < newPapers.length; i += 50) {
    const batch = newPapers.slice(i, i + 50).map((p) => ({
      title: p.title,
      authors: p.authors,
      venue: p.venue,
      url: p.url,
      published_date: p.published_date,
      abstract: p.abstract,
    }));
    const { data: inserted, error } = await supabase.from("papers").insert(batch).select("id");
    if (!error && inserted) {
      imported += inserted.length;
      const topicRows = newPapers.slice(i, i + 50).flatMap((p, j) =>
        (p.topics ?? []).map((t) => ({ paper_id: inserted[j]?.id, topic_slug: t }))
      ).filter((r) => r.paper_id);
      if (topicRows.length > 0) {
        await supabase.from("paper_topics").insert(topicRows);
      }
    }
  }

  return NextResponse.json({
    imported,
    total_fetched: allPapers.length,
    already_existed: allPapers.length - newPapers.length,
    categoryStats,
  });
}
