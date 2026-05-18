import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import {
  fetchSingleArxivCategory,
  fetchSingleS2Venue,
  ARXIV_CATEGORIES,
  S2_VENUES,
} from "@/lib/admin/paper-import";
import type { ImportedPaper } from "@/lib/admin/paper-import";

export const dynamic = "force-dynamic";

const CURRENT_YEAR = 2026;

async function upsertPapers(fetched: ImportedPaper[]) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("papers")
    .select("title, citation_count");
  const existingMap = new Map(
    (existing ?? []).map((p) => [p.title.toLowerCase(), p.citation_count as number | null]),
  );
  const newPapers = fetched.filter((p) => !existingMap.has(p.title.toLowerCase()));

  const updateTasks: Promise<void>[] = [];
  for (const p of fetched) {
    const key = p.title.toLowerCase();
    if (
      existingMap.has(key) &&
      p.citation_count !== undefined &&
      existingMap.get(key) !== p.citation_count
    ) {
      updateTasks.push(
        (async () => {
          await supabase
            .from("papers")
            .update({ citation_count: p.citation_count })
            .eq("title", p.title);
        })(),
      );
    }
  }
  await Promise.all(updateTasks);

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
      citation_count: p.citation_count ?? null,
      source: p.source,
    }));
    const { error } = await supabase.from("papers").insert(batch);
    if (!error) imported += batch.length;
  }

  return { imported, updated: updateTasks.length };
}

export async function POST(request: Request) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const category = searchParams.get("category");
  const venue = searchParams.get("venue");

  if (source === "arxiv" && category) {
    if (!ARXIV_CATEGORIES.includes(category as (typeof ARXIV_CATEGORIES)[number])) {
      return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 });
    }
    const result = await fetchSingleArxivCategory(category, CURRENT_YEAR);
    const { imported, updated } = await upsertPapers(result.papers);
    return NextResponse.json({
      imported,
      updated,
      total_fetched: result.papers.length,
      step: result.categoryStats[0],
    });
  }

  if (source === "s2" && venue) {
    if (!S2_VENUES.includes(venue as (typeof S2_VENUES)[number])) {
      return NextResponse.json({ error: `Invalid venue: ${venue}` }, { status: 400 });
    }
    const result = await fetchSingleS2Venue(venue, CURRENT_YEAR);
    const { imported, updated } = await upsertPapers(result.papers);
    return NextResponse.json({
      imported,
      updated,
      total_fetched: result.papers.length,
      step: result.categoryStats[0],
    });
  }

  if (!source) {
    const allStats = [];
    let totalImported = 0;
    let totalUpdated = 0;
    let totalFetched = 0;

    for (const cat of ARXIV_CATEGORIES) {
      const result = await fetchSingleArxivCategory(cat, CURRENT_YEAR);
      const { imported, updated } = await upsertPapers(result.papers);
      totalImported += imported;
      totalUpdated += updated;
      totalFetched += result.papers.length;
      allStats.push(result.categoryStats[0]);
    }

    for (const v of S2_VENUES) {
      const result = await fetchSingleS2Venue(v, CURRENT_YEAR);
      const { imported, updated } = await upsertPapers(result.papers);
      totalImported += imported;
      totalUpdated += updated;
      totalFetched += result.papers.length;
      allStats.push(result.categoryStats[0]);
    }

    const supabase = await createClient();
    await supabase.from("sync_meta").upsert(
      {
        entity: "papers",
        last_sync_at: new Date().toISOString(),
        last_result: { categoryStats: allStats },
      },
      { onConflict: "entity" },
    );

    return NextResponse.json({
      imported: totalImported,
      updated: totalUpdated,
      total_fetched: totalFetched,
      categoryStats: allStats,
    });
  }

  return NextResponse.json({ error: "Invalid params" }, { status: 400 });
}
