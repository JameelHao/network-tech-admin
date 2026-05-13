import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAllNetworkPapers } from "@/lib/admin/paper-import";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  const supabase = await createClient();
  const { papers: fetched, categoryStats } = await fetchAllNetworkPapers(2026);

  if (fetched.length === 0) {
    await supabase.from("sync_meta").upsert(
      { entity: "papers", last_sync_at: new Date().toISOString(), last_result: { categoryStats } },
      { onConflict: "entity" },
    );
    return NextResponse.json({ imported: 0, total_fetched: 0, categoryStats });
  }

  const { data: existing } = await supabase.from("papers").select("title, citation_count");
  const existingMap = new Map((existing ?? []).map((p) => [p.title.toLowerCase(), p.citation_count as number | null]));
  const newPapers = fetched.filter((p) => !existingMap.has(p.title.toLowerCase()));

  const updateTasks: Promise<void>[] = [];
  for (const p of fetched) {
    const key = p.title.toLowerCase();
    if (existingMap.has(key) && p.citation_count !== undefined && existingMap.get(key) !== p.citation_count) {
      updateTasks.push(
        (async () => {
          await supabase.from("papers").update({ citation_count: p.citation_count }).eq("title", p.title);
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

  await supabase.from("sync_meta").upsert(
    { entity: "papers", last_sync_at: new Date().toISOString(), last_result: { categoryStats } },
    { onConflict: "entity" },
  );

  return NextResponse.json({ imported, updated: updateTasks.length, total_fetched: fetched.length, categoryStats });
}
