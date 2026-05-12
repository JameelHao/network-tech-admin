import { createClient } from "@/lib/supabase/server";
import { buildResult, validateSort, type PaginatedResult, type PaginationParams } from "./pagination";

export type NewsItem = {
  id: string;
  title: string;
  link: string;
  snippet: string | null;
  source: string | null;
  pub_date: string | null;
  category: string;
  created_at: string;
};

export const NEWS_SORTABLE = ["title", "source", "pub_date"] as const;

export type NewsFilter = {
  keyword?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function escapePostgrestValue(s: string): string {
  return s.replace(/[,(){}."\\]/g, "");
}

export async function listNews(
  params?: PaginationParams,
  filter?: NewsFilter,
): Promise<PaginatedResult<NewsItem>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { column, ascending } = validateSort(params?.sort, params?.dir, NEWS_SORTABLE, "pub_date", "desc");

  let query = supabase
    .from("news_items")
    .select("*", { count: "exact" })
    .eq("category", "news")
    .order(column, { ascending, nullsFirst: false });

  if (filter?.keyword) {
    const safe = escapePostgrestValue(filter.keyword);
    if (safe) {
      query = query.or(`title.ilike.%${safe}%,snippet.ilike.%${safe}%`);
    }
  }
  if (filter?.source) {
    query = query.eq("source", filter.source);
  }
  if (filter?.dateFrom) {
    query = query.gte("pub_date", filter.dateFrom);
  }
  if (filter?.dateTo) {
    query = query.lte("pub_date", filter.dateTo);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return buildResult((data as NewsItem[]) ?? [], count ?? 0, { page, pageSize });
}
