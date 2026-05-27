import { createClient } from "@/lib/supabase/server";
import { buildResult, validateSort, type PaginatedResult, type PaginationParams } from "./pagination";
import type { Product, ProductCategory, ProductPricing } from "./types";

export type CloudProductInput = {
  name: string;
  vendor: string;
  category: ProductCategory;
  description: string;
  url: string;
  pricing: ProductPricing;
  topics: string[];
  source_url: string;
  published_at: string;
};

export const PRODUCT_SORTABLE = ["name", "vendor", "category", "release_date", "stage", "published_at"] as const;

export async function listProducts(
  params?: PaginationParams,
  filter?: { category?: string; vendor?: string; keyword?: string; topic?: string },
): Promise<PaginatedResult<Product>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { column, ascending } = validateSort(params?.sort, params?.dir, PRODUCT_SORTABLE, "published_at", "desc");

  const sortByPublished = column === "published_at";
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order(column, { ascending, nullsFirst: sortByPublished ? false : undefined });

  if (filter?.category) query = query.eq("category", filter.category);
  if (filter?.vendor) query = query.ilike("vendor", `%${filter.vendor}%`);
  if (filter?.keyword) query = query.ilike("name", `%${filter.keyword}%`);
  if (filter?.topic) query = query.contains("topics", [filter.topic]);

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

export async function upsertCloudProducts(
  items: CloudProductInput[],
): Promise<{ inserted: number; updated: number }> {
  if (items.length === 0) return { inserted: 0, updated: 0 };

  const supabase = await createClient();
  const urls = items.map((i) => i.source_url);

  // Batch lookup to avoid URL length limit on Supabase REST in() clause
  const existingMap = new Map<string, string>();
  const batchSize = 50;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const { data: batchData, error: batchError } = await supabase
      .from("products")
      .select("id, source_url")
      .in("source_url", batch);
    if (batchError) {
      console.log(`[upsertCloudProducts] batch fetch error: ${batchError.message}`);
    } else if (batchData) {
      for (const r of batchData) {
        existingMap.set(r.source_url, r.id);
      }
    }
  }
  console.log(`[upsertCloudProducts] ${items.length} items, ${existingMap.size} existing match`);

  let inserted = 0;
  let updated = 0;

  for (const item of items) {
    const existingId = existingMap.get(item.source_url);

    if (existingId) {
      const { error } = await supabase
        .from("products")
        .update({
          description: item.description,
          topics: item.topics,
          published_at: item.published_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingId);

      if (error) {
        console.log(`[upsertCloudProducts] update error "${item.name}": ${error.message}`);
      } else {
        updated++;
      }
    } else {
      const { error } = await supabase.from("products").insert({
        name: item.name,
        vendor: item.vendor,
        category: item.category,
        description: item.description,
        url: item.url,
        pricing: item.pricing,
        topics: item.topics,
        source: "cloud-releases",
        source_url: item.source_url,
        published_at: item.published_at,
      });

      if (error) {
        console.log(`[upsertCloudProducts] insert error "${item.name}": ${error.message}`);
      } else {
        inserted++;
      }
    }
  }

  return { inserted, updated };
}
