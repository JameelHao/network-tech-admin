import { createClient } from "@/lib/supabase/server";
import { buildResult, validateSort, type PaginatedResult, type PaginationParams } from "./pagination";
import type { OpenSource } from "./types";

export const OS_SORTABLE = ["name", "stars", "last_active", "language"] as const;

export async function listOpenSource(
  params?: PaginationParams,
  filter?: { language?: string; topic?: string; starsMin?: number; starsMax?: number },
): Promise<PaginatedResult<OpenSource>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { column, ascending } = validateSort(params?.sort, params?.dir, OS_SORTABLE, "stars", "desc");

  let query = supabase
    .from("opensource")
    .select("*", { count: "exact" })
    .order(column, { ascending });

  if (filter?.language) query = query.eq("language", filter.language);
  if (filter?.topic) query = query.contains("topics", [filter.topic]);
  if (filter?.starsMin != null) query = query.gte("stars", filter.starsMin);
  if (filter?.starsMax != null) query = query.lte("stars", filter.starsMax);

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return buildResult((data as OpenSource[]) ?? [], count ?? 0, { page, pageSize });
}

export async function listAllOpenSourceLight(): Promise<Pick<OpenSource, "id" | "name" | "topics">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opensource")
    .select("id, name, topics")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  return data ?? [];
}

export async function getOpenSource(id: string): Promise<OpenSource | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opensource")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as OpenSource) ?? null;
}
