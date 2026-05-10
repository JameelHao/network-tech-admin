import { createClient } from "@/lib/supabase/server";
import type { Conference, ConferenceSession } from "./types";

export async function listConferences(): Promise<Conference[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conferences")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data as Conference[];
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
