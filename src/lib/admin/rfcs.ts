import { createClient } from "@/lib/supabase/server";
import { buildResult, validateSort, type PaginatedResult, type PaginationParams } from "./pagination";
import type { Rfc } from "./types";

export const RFC_SORTABLE = ["rfc_number", "published_at"] as const;

export async function listRfcs(
  params?: PaginationParams,
  filter?: { keyword?: string; company?: string },
): Promise<PaginatedResult<Rfc>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { column, ascending } = validateSort(params?.sort, params?.dir, RFC_SORTABLE, "published_at", "desc");

  let query = supabase
    .from("rfcs")
    .select("*", { count: "exact" })
    .order(column, { ascending, nullsFirst: column !== "published_at" });

  if (filter?.keyword) query = query.ilike("title", `%${filter.keyword}%`);
  if (filter?.company) query = query.contains("companies", [filter.company]);

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return buildResult((data as Rfc[]) ?? [], count ?? 0, { page, pageSize });
}

export async function upsertRfcs(
  items: { rfc_number: number; title: string; abstract: string; url: string; published_at: string; topics: string[]; companies: string[] }[],
): Promise<{ inserted: number; updated: number }> {
  if (items.length === 0) return { inserted: 0, updated: 0 };

  const supabase = await createClient();
  let inserted = 0;
  let updated = 0;

  for (const item of items) {
    const { data: existing } = await supabase
      .from("rfcs")
      .select("id")
      .eq("rfc_number", item.rfc_number)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("rfcs")
        .update({
          title: item.title,
          abstract: item.abstract,
          published_at: item.published_at,
          topics: item.topics,
          companies: item.companies,
        })
        .eq("id", existing.id);

      if (!error) updated++;
    } else {
      const { error } = await supabase.from("rfcs").insert({
        rfc_number: item.rfc_number,
        title: item.title,
        abstract: item.abstract,
        url: item.url,
        published_at: item.published_at,
        topics: item.topics,
        companies: item.companies,
      });

      if (!error) inserted++;
    }
  }

  return { inserted, updated };
}
