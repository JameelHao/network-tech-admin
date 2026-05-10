import { createClient } from "@/lib/supabase/server";
import type { TalentLead } from "./types";

export async function listTalentLeads(): Promise<TalentLead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talent_leads")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data as TalentLead[];
}

export async function getTalentLead(id: string): Promise<TalentLead | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talent_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as TalentLead) ?? null;
}

export async function createTalentLead(data: Omit<TalentLead, "id" | "created_at" | "updated_at">): Promise<TalentLead> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("talent_leads")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return row as TalentLead;
}

export async function updateTalentLead(id: string, data: Partial<Omit<TalentLead, "id" | "created_at" | "updated_at">>): Promise<TalentLead> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("talent_leads")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return row as TalentLead;
}

export async function deleteTalentLead(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("talent_leads")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
