import { createClient } from "@/lib/supabase/server";
import { buildResult, validateSort, type PaginatedResult, type PaginationParams } from "./pagination";
import { escapePostgrestValue, type NewsItem } from "./news";

export const JOBS_SORTABLE = ["title", "source", "pub_date"] as const;

export type JobsFilter = {
  keyword?: string;
  source?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function listJobs(
  params?: PaginationParams,
  filter?: JobsFilter,
): Promise<PaginatedResult<NewsItem>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { column, ascending } = validateSort(params?.sort, params?.dir, JOBS_SORTABLE, "pub_date", "desc");

  let query = supabase
    .from("news_items")
    .select("*", { count: "exact" })
    .eq("category", "job")
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
  if (filter?.status) {
    const threshold = new Date(Date.now() - 30 * 86_400_000).toISOString();
    if (filter.status === "active") query = query.gte("pub_date", threshold);
    else if (filter.status === "expired") query = query.lt("pub_date", threshold);
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
