import { createClient } from "@/lib/supabase/server";
import { buildResult, validateSort, type PaginatedResult, type PaginationParams } from "./pagination";
import type { Product } from "./types";

export const PRODUCT_SORTABLE = ["name", "vendor", "category", "release_date", "stage"] as const;

export async function listProducts(
  params?: PaginationParams,
  filter?: { category?: string; vendor?: string; stage?: string; pricing?: string; keyword?: string },
): Promise<PaginatedResult<Product>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { column, ascending } = validateSort(params?.sort, params?.dir, PRODUCT_SORTABLE, "created_at", "desc");

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order(column, { ascending });

  if (filter?.category) query = query.eq("category", filter.category);
  if (filter?.vendor) query = query.ilike("vendor", `%${filter.vendor}%`);
  if (filter?.stage) query = query.eq("stage", filter.stage);
  if (filter?.pricing) query = query.eq("pricing", filter.pricing);
  if (filter?.keyword) query = query.ilike("name", `%${filter.keyword}%`);

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return buildResult((data as Product[]) ?? [], count ?? 0, { page, pageSize });
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as Product) ?? null;
}

export async function createProduct(data: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("products")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return row as Product;
}

export async function updateProduct(id: string, data: Partial<Omit<Product, "id" | "created_at" | "updated_at">>): Promise<Product> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("products")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return row as Product;
}
