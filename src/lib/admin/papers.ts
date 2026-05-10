import { createClient } from "@/lib/supabase/server";
import type { Paper } from "./types";

export async function listPapers(): Promise<Paper[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("papers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Paper[];
}

export async function getPaper(id: string): Promise<Paper | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("papers")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as Paper) ?? null;
}
