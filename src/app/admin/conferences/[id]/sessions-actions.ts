"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SessionFormState = { error?: string; success?: boolean } | undefined;

export async function createSession(_prev: SessionFormState, formData: FormData): Promise<SessionFormState> {
  const conference_id = formData.get("conference_id") as string;
  const title = formData.get("title") as string;
  const authorsRaw = formData.get("authors") as string;
  const affiliationsRaw = formData.get("affiliations") as string;
  const topicsRaw = formData.getAll("topics") as string[];
  const url = (formData.get("url") as string) || null;

  if (!conference_id || !title) {
    return { error: "Title is required" };
  }

  const authors = authorsRaw
    ? authorsRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : [];
  const affiliations = affiliationsRaw
    ? affiliationsRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : [];

  const supabase = await createClient();
  const { error } = await supabase.from("conference_sessions").insert({
    conference_id,
    title,
    authors,
    affiliations,
    topics: topicsRaw,
    url,
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/conferences/${conference_id}`);
  return { success: true };
}

export async function deleteSession(id: string, conferenceId: string) {
  const supabase = await createClient();
  await supabase.from("conference_sessions").delete().eq("id", id);
  revalidatePath(`/admin/conferences/${conferenceId}`);
}

export async function batchImportSessions(
  conferenceId: string,
  sessions: { title: string; authors: string[]; topics: string[]; affiliations?: string[]; url?: string }[]
): Promise<{ error?: string; count?: number }> {
  if (!sessions.length) return { error: "No sessions to import" };

  const supabase = await createClient();
  const rows = sessions.map((s) => ({
    conference_id: conferenceId,
    title: s.title,
    authors: s.authors,
    affiliations: s.affiliations || [],
    topics: s.topics,
    url: s.url || null,
  }));

  const { error } = await supabase.from("conference_sessions").insert(rows);
  if (error) return { error: error.message };

  revalidatePath(`/admin/conferences/${conferenceId}`);
  return { count: rows.length };
}
