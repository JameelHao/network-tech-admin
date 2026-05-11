import { createClient } from "@/lib/supabase/server";
import { buildResult, type PaginatedResult, type PaginationParams } from "./pagination";
import type { OpenSource } from "./types";

export async function listOpenSource(params?: PaginationParams): Promise<PaginatedResult<OpenSource>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("opensource")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return buildResult((data as OpenSource[]) ?? [], count ?? 0, { page, pageSize });
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
