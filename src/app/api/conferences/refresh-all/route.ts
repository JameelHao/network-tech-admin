import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { searchWeb, extractDates, extractLocation } from "@/lib/admin/search";

export async function POST() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const supabase = await createClient();

  const { data: conferences, error } = await supabase
    .from("conferences")
    .select("id, name, abbreviation, url");

  if (error || !conferences) {
    return NextResponse.json({ error: "Failed to fetch conferences" }, { status: 500 });
  }

  const results: { id: string; name: string; updates: Record<string, string>; error?: string }[] = [];

  for (const conf of conferences) {
    const year = new Date().getFullYear();
    const query = `${conf.abbreviation || conf.name} ${year} ${year + 1} conference dates location`;
    try {
      const searchResults = await searchWeb(query);
      const allText = searchResults.map((r) => r.snippet).join(" ");

      const dates = extractDates(allText);
      const location = extractLocation(allText);

      const updates: Record<string, string> = {};
      if (dates.start_date) updates.start_date = dates.start_date;
      if (dates.end_date) updates.end_date = dates.end_date;
      if (location) updates.location = location;
      if (searchResults[0]?.link) updates.url = searchResults[0].link;

      if (Object.keys(updates).length > 0) {
        await supabase.from("conferences").update(updates).eq("id", conf.id);
      }

      results.push({ id: conf.id, name: conf.abbreviation || conf.name, updates });
    } catch (e) {
      results.push({ id: conf.id, name: conf.abbreviation || conf.name, updates: {}, error: (e as Error).message });
    }
  }

  return NextResponse.json({ success: true, results });
}
