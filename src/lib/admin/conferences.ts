import { createClient } from "@/lib/supabase/server";
import { buildResult, type PaginatedResult, type PaginationParams } from "./pagination";
import type { Conference, ConferenceSession } from "./types";

export async function listConferences(
  params?: PaginationParams,
  filter?: { category?: string },
): Promise<PaginatedResult<Conference>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("conferences")
    .select("*", { count: "exact" })
    .order("start_date", { ascending: false });

  if (filter?.category && filter.category !== "all") {
    query = query.eq("category", filter.category);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return buildResult((data as Conference[]) ?? [], count ?? 0, { page, pageSize });
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
