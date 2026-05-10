import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadStage } from "./types";

export async function listLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data as Lead[];
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
