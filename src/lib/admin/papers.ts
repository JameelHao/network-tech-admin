import { createClient } from "@/lib/supabase/server";
import { buildResult, type PaginatedResult, type PaginationParams } from "./pagination";
import type { Paper } from "./types";

function mapRow(row: any): Paper {
  return { ...row, topics: (row.paper_topics ?? []).map((pt: any) => pt.topic_slug), paper_topics: undefined };
}

const PAPER_WITH_TOPICS = "*, paper_topics(topic_slug)";

export async function listPapers(params?: PaginationParams): Promise<PaginatedResult<Paper>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("papers")
    .select(PAPER_WITH_TOPICS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return buildResult((data ?? []).map(mapRow), count ?? 0, { page, pageSize });
}

export async function getPaperCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("papers")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function listPapersForList(): Promise<{ papers: Paper[]; total: number }> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("papers")
    .select("*", { count: "exact", head: true });

  const all: Paper[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("papers")
      .select("id, title, authors, venue, url, published_date, citation_count, source, created_at, paper_topics(topic_slug)")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data.map(mapRow));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return { papers: all, total: count ?? all.length };
}

export async function getPaperFull(id: string): Promise<Paper | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("papers")
    .select("*, paper_topics(topic_slug)")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ? mapRow(data) : null;
}

export async function listAllPapers(): Promise<{ papers: Paper[]; total: number }> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("papers")
    .select("*", { count: "exact", head: true });

  const all: Paper[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("papers")
      .select(PAPER_WITH_TOPICS)
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data.map(mapRow));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return { papers: all, total: count ?? all.length };
}

export async function listAllPapersLight(): Promise<Paper[]> {
  const supabase = await createClient();
  const all: Paper[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("papers")
      .select("id, title, published_date, authors, venue, url, abstract, notes, created_at, paper_topics(topic_slug)")
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data.map(mapRow));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

export async function getPaper(id: string): Promise<Paper | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("papers")
    .select(PAPER_WITH_TOPICS)
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ? mapRow(data) : null;
}
