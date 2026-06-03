import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import {
  fetchSingleArxivCategory,
  fetchSingleS2Venue,
  fetchCompanyArxivPapers,
  ARXIV_CATEGORIES,
  S2_VENUES,
  COMPANY_SLUGS,
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

  // Intra-batch dedup
  const seen = new Set<string>();
  const deduped = fetched.filter((p) => {
    const key = p.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const newPapers = deduped.filter((p) => !existingMap.has(p.title.toLowerCase()));

  // Update citation counts for existing papers
  const updateTasks: Promise<void>[] = [];
  for (const p of fetched) {
    const key = p.title.toLowerCase();
    if (existingMap.has(key) && p.citation_count !== undefined && existingMap.get(key) !== p.citation_count) {
      updateTasks.push(
        supabase.from("papers").update({ citation_count: p.citation_count }).eq("title", p.title).then(),
      );
    }
  }
  await Promise.all(updateTasks);

  // Insert new papers individually so 1 duplicate doesn't kill the batch
  // (unique index on normalized title catches any race-condition duplicates)
  let imported = 0;
  for (const p of newPapers) {
    const { data: inserted } = await supabase
      .from("papers")
      .insert({
        title: p.title,
        authors: p.authors,
        venue: p.venue,
        url: p.url,
        published_date: p.published_date,
        abstract: p.abstract,
        citation_count: p.citation_count ?? null,
        source: p.source,
        companies: p.companies,
      })
      .select("id");
    if (inserted && inserted.length > 0) {
      imported++;
      const topicRows = (p.topics ?? []).map((t) => ({ paper_id: inserted[0].id, topic_slug: t }));
      if (topicRows.length > 0) {
        await supabase.from("paper_topics").insert(topicRows);
      }
    }
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
    const result = await fetchSingleArxivCategory(category, CURRENT_YEAR, 5);
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
    const result = await fetchSingleS2Venue(venue, CURRENT_YEAR, 5);
    const { imported, updated } = await upsertPapers(result.papers);
    return NextResponse.json({
      imported,
      updated,
      total_fetched: result.papers.length,
      step: result.categoryStats[0],
    });
  }

  if (!source) {
    // Collect all sources first, dedup globally, then upsert once
    const allStats = [];
    const allFetched: ImportedPaper[] = [];

    for (const cat of ARXIV_CATEGORIES) {
      const result = await fetchSingleArxivCategory(cat, CURRENT_YEAR);
      allFetched.push(...result.papers);
      allStats.push(result.categoryStats[0]);
    }

    for (const v of S2_VENUES) {
      const result = await fetchSingleS2Venue(v, CURRENT_YEAR);
      allFetched.push(...result.papers);
      allStats.push(result.categoryStats[0]);
    }

    for (const slug of COMPANY_SLUGS) {
      const result = await fetchCompanyArxivPapers(slug, CURRENT_YEAR, 5);
      allFetched.push(...result.papers);
      allStats.push(...result.categoryStats);
    }

    // Global dedup — same paper from cs.NI + cs.AI
    const seen = new Set<string>();
    const deduped = allFetched.filter((p) => {
      const key = p.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const { imported, updated } = await upsertPapers(deduped);

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
      imported,
      updated,
      total_fetched: allFetched.length,
      deduped: allFetched.length - deduped.length,
      categoryStats: allStats,
    });
  }

  return NextResponse.json({ error: "Invalid params" }, { status: 400 });
}
