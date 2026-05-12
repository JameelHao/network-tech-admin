import { createClient } from "@/lib/supabase/server";
import { fetchAllNetworkPapers } from "./paper-import";
import { buildResult, validateSort, type PaginatedResult, type PaginationParams } from "./pagination";
import type { Paper } from "./types";

export const PAPER_SORTABLE = ["title", "published_date", "venue"] as const;

export type PaperFilter = {
  keyword?: string;
  venue?: string;
  topic?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function listPapers(params?: PaginationParams, filter?: PaperFilter): Promise<PaginatedResult<Paper>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { column, ascending } = validateSort(params?.sort, params?.dir, PAPER_SORTABLE, "published_date", "desc");

  let query = supabase
    .from("papers")
    .select("*", { count: "exact" })
    .order(column, { ascending, nullsFirst: false });

  if (filter?.keyword) {
    query = query.or(`title.ilike.%${filter.keyword}%,authors.cs.{${filter.keyword}}`);
  }
  if (filter?.venue) {
    query = query.eq("venue", filter.venue);
  }
  if (filter?.topic) {
    query = query.contains("topics", [filter.topic]);
  }
  if (filter?.dateFrom) {
    query = query.gte("published_date", filter.dateFrom);
  }
  if (filter?.dateTo) {
    query = query.lte("published_date", filter.dateTo);
  }

  const { data, error, count } = await query.range(from, to);

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
