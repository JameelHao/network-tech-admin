import { createClient } from "@/lib/supabase/server";
import { buildResult, type PaginatedResult, type PaginationParams } from "./pagination";
import type { Lead, LeadStage } from "./types";

export async function listLeads(params?: PaginationParams): Promise<PaginatedResult<Lead>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return buildResult((data as Lead[]) ?? [], count ?? 0, { page, pageSize });
}

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as Lead) ?? null;
}

export function getStageCounts(leads: Lead[]): Record<LeadStage, number> {
  const counts: Record<LeadStage, number> = { new: 0, tracking: 0, evaluating: 0, archived: 0 };
  for (const l of leads) counts[l.stage]++;
  return counts;
}
