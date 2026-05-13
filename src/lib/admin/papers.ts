import { createClient } from "@/lib/supabase/server";
import { fetchAllNetworkPapers } from "./paper-import";
import { buildResult, type PaginatedResult, type PaginationParams } from "./pagination";
import type { Paper } from "./types";

export async function listPapers(params?: PaginationParams): Promise<PaginatedResult<Paper>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("papers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return buildResult((data as Paper[]) ?? [], count ?? 0, { page, pageSize });
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
  const { papers: fetched } = await fetchAllNetworkPapers(2026);

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

export async function listAllPapersLight(): Promise<Paper[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("papers")
    .select("id, title, topics, published_date, authors, venue, url, abstract, notes, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  return (data as Paper[]) ?? [];
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
