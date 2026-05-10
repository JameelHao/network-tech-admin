import { createClient } from "@/lib/supabase/server";
import { fetchPapersForVenue, fetchAllNetworkPapers } from "@/lib/admin/paper-import";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/papers/search?venue=sigcomm&year=2026
// venue omitted → all venues
// Results are auto-saved to DB and returned
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const venue = searchParams.get("venue") || undefined;
    const year = Number(searchParams.get("year")) || 2026;

    let papers;
    if (venue) {
      papers = await fetchPapersForVenue(venue, year);
    } else {
      papers = await fetchAllNetworkPapers(year);
    }

    if (papers.length === 0) {
      return NextResponse.json({ papers: [], imported: 0 });
    }

    const supabase = await createClient();

    // Deduplicate against existing
    const { data: existing } = await supabase.from("papers").select("title");
    const existingTitles = new Set((existing ?? []).map((p) => p.title.toLowerCase()));

    const newPapers = papers.filter((p) => !existingTitles.has(p.title.toLowerCase()));

    // Insert new ones
    let imported = 0;
    if (newPapers.length > 0) {
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
    }

    // Return all papers (existing + newly imported) from DB
    const { data: allPapers } = await supabase
      .from("papers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    return NextResponse.json({
      papers: allPapers ?? [],
      imported,
      total: papers.length,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ papers: [], error: msg }, { status: 500 });
  }
}
