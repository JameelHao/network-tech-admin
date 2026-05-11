import { createClient } from "@/lib/supabase/server";
import { buildResult, validateSort, type PaginatedResult, type PaginationParams } from "./pagination";
import type { Conference, ConferenceSession } from "./types";

export const CONF_SORTABLE = ["name", "start_date", "tier", "category"] as const;

export async function listConferences(
  params?: PaginationParams,
  filter?: { category?: string; status?: string; dateFrom?: string; dateTo?: string },
): Promise<PaginatedResult<Conference>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { column, ascending } = validateSort(params?.sort, params?.dir, CONF_SORTABLE, "start_date", "desc");

  let query = supabase
    .from("conferences")
    .select("*", { count: "exact" })
    .order(column, { ascending });

  if (filter?.category && filter.category !== "all") {
    query = query.eq("category", filter.category);
  }
  if (filter?.status) {
    const today = new Date().toISOString().slice(0, 10);
    if (filter.status === "upcoming") query = query.gte("end_date", today);
    else if (filter.status === "past") query = query.lt("end_date", today);
  }
  if (filter?.dateFrom) query = query.gte("start_date", filter.dateFrom);
  if (filter?.dateTo) query = query.lte("start_date", filter.dateTo);

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return buildResult((data as Conference[]) ?? [], count ?? 0, { page, pageSize });
}

export async function listConferencesByMonth(year: number, month: number): Promise<Conference[]> {
  const supabase = await createClient();
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("conferences")
    .select("*")
    .lte("start_date", monthEnd)
    .or(`end_date.gte.${monthStart},and(end_date.is.null,start_date.gte.${monthStart})`)
    .order("start_date", { ascending: true });

  if (error) throw error;
  return (data as Conference[]) ?? [];
}

export async function listConferencesByYear(year: number): Promise<Conference[]> {
  const supabase = await createClient();
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const { data, error } = await supabase
    .from("conferences")
    .select("*")
    .lte("start_date", yearEnd)
    .or(`end_date.gte.${yearStart},and(end_date.is.null,start_date.gte.${yearStart})`)
    .order("start_date", { ascending: true });

  if (error) throw error;
  return (data as Conference[]) ?? [];
}

export async function getConference(id: string): Promise<Conference | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conferences")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as Conference) ?? null;
}

export async function listConferenceSessions(conferenceId: string): Promise<ConferenceSession[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conference_sessions")
    .select("*")
    .eq("conference_id", conferenceId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as ConferenceSession[];
}
