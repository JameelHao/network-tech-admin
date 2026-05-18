import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { searchWeb, extractDates, extractLocation, searchPapers } from "@/lib/admin/search";

export async function POST(request: Request) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: conf, error: fetchError } = await supabase
    .from("conferences")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !conf) {
    return NextResponse.json({ error: "Conference not found" }, { status: 404 });
  }

  const year = new Date().getFullYear();

  try {
    // 1. Update conference info (dates, location)
    const infoQuery = `${conf.abbreviation || conf.name} ${year} ${year + 1} conference dates location`;
    const infoResults = await searchWeb(infoQuery);
    const allText = infoResults.map((r) => r.snippet).join(" ");

    const dates = extractDates(allText);
    const location = extractLocation(allText);

    const updates: Record<string, string> = {};
    if (dates.start_date) updates.start_date = dates.start_date;
    if (dates.end_date) updates.end_date = dates.end_date;
    if (location) updates.location = location;
    if (infoResults[0]?.link) updates.url = infoResults[0].link;

    if (Object.keys(updates).length > 0) {
      await supabase.from("conferences").update(updates).eq("id", id);
    }

    // 2. Search and import papers/sessions
    const papers = await searchPapers(conf.abbreviation || conf.name, year);

    let imported = 0;
    if (papers.length > 0) {
      const { data: existing } = await supabase
        .from("conference_sessions")
        .select("title")
        .eq("conference_id", id);

      const existingTitles = new Set((existing ?? []).map((e) => e.title.toLowerCase()));

      const newPapers = papers.filter((p) => !existingTitles.has(p.title.toLowerCase()));

      if (newPapers.length > 0) {
        const rows = newPapers.map((p) => ({
          conference_id: id,
          title: p.title,
          authors: p.authors,
          affiliations: p.affiliations,
          topics: p.topics,
          url: p.url || null,
        }));

        const { error: insertError } = await supabase
          .from("conference_sessions")
          .insert(rows);

        if (!insertError) imported = newPapers.length;
      }
    }

    return NextResponse.json({
      success: true,
      updates,
      imported,
      sources: infoResults.slice(0, 3),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
