import { createClient } from "@/lib/supabase/server";
import { buildResult, validateSort, type PaginatedResult, type PaginationParams } from "./pagination";
import type { Vendor } from "./types";

export const VENDOR_SORTABLE = ["name", "type", "founded_year", "stage"] as const;

export async function listVendors(
  params?: PaginationParams,
  filter?: { type?: string; stage?: string; topic?: string; keyword?: string },
): Promise<PaginatedResult<Vendor>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { column, ascending } = validateSort(params?.sort, params?.dir, VENDOR_SORTABLE, "created_at", "desc");

  let query = supabase
    .from("vendors")
    .select("*", { count: "exact" })
    .order(column, { ascending });

  if (filter?.type) query = query.eq("type", filter.type);
  if (filter?.stage) query = query.eq("stage", filter.stage);
  if (filter?.topic) query = query.contains("topics", [filter.topic]);
  if (filter?.keyword) query = query.ilike("name", `%${filter.keyword}%`);

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return buildResult((data as Vendor[]) ?? [], count ?? 0, { page, pageSize });
}

export async function getVendor(id: string): Promise<Vendor | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as Vendor) ?? null;
}

export async function createVendor(data: Omit<Vendor, "id" | "created_at" | "updated_at">): Promise<Vendor> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("vendors")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return row as Vendor;
}

export async function updateVendor(id: string, data: Partial<Omit<Vendor, "id" | "created_at" | "updated_at">>): Promise<Vendor> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("vendors")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return row as Vendor;
}
