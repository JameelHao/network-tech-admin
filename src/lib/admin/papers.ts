import { createClient } from "@/lib/supabase/server";
import { fetchAllNetworkPapers } from "./paper-import";
import type { Paper } from "./types";

export async function listPapers(): Promise<Paper[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("papers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Paper[];
}

export async function fetchAndSyncPapers(): Promise<Paper[]> {
  const supabase = await createClient();

  // If DB has papers, return them directly
  const { data, error } = await supabase
    .from("papers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) throw error;
  if (data && data.length > 0) return data as Paper[];

  // DB empty — fetch from arXiv and populate
  const fetched = await fetchAllNetworkPapers(2026);

  if (fetched.length > 0) {
    for (let i = 0; i < fetched.length; i += 50) {
      const batch = fetched.slice(i, i + 50).map((p) => ({
        title: p.title,
        authors: p.authors,
        venue: p.venue,
        url: p.url,
        published_date: p.published_date,
        abstract: p.abstract,
        topics: p.topics,
      }));
      await supabase.from("papers").insert(batch);
    }
  }

  const { data: all } = await supabase
    .from("papers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  return (all as Paper[]) ?? [];
}

export async function getPaper(id: string): Promise<Paper | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("papers")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as Paper) ?? null;
}
