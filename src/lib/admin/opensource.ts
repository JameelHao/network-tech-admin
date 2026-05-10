import { createClient } from "@/lib/supabase/server";
import type { OpenSource } from "./types";

export async function listOpenSource(): Promise<OpenSource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opensource")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as OpenSource[];
}

export async function getOpenSource(id: string): Promise<OpenSource | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opensource")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as OpenSource) ?? null;
}
