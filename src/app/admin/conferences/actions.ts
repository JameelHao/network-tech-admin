"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type ConferenceFormState = { error?: string; success?: boolean } | undefined;

export async function createConference(_prev: ConferenceFormState, formData: FormData): Promise<ConferenceFormState> {
  const name = formData.get("name") as string;
  const abbreviation = (formData.get("abbreviation") as string) || null;
  const url = (formData.get("url") as string) || null;
  const location = (formData.get("location") as string) || null;
  const start_date = formData.get("start_date") as string;
  const end_date = (formData.get("end_date") as string) || null;
  const category = formData.get("category") as string;
  const tier = formData.get("tier") as string;
  const topics = formData.getAll("topics") as string[];
  const notes = (formData.get("notes") as string) || null;

  if (!name || !start_date || !category || !tier) {
    return { error: "Required fields missing" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("conferences").insert({
    name,
    abbreviation,
    url,
    location,
    start_date,
    end_date: end_date || null,
    category,
    tier,
    topics,
    notes,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/admin/conferences");
}

export async function updateConference(_prev: ConferenceFormState, formData: FormData): Promise<ConferenceFormState> {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const abbreviation = (formData.get("abbreviation") as string) || null;
  const url = (formData.get("url") as string) || null;
  const location = (formData.get("location") as string) || null;
  const start_date = formData.get("start_date") as string;
  const end_date = (formData.get("end_date") as string) || null;
  const category = formData.get("category") as string;
  const tier = formData.get("tier") as string;
  const topics = formData.getAll("topics") as string[];
  const notes = (formData.get("notes") as string) || null;

  if (!id || !name || !start_date || !category || !tier) {
    return { error: "Required fields missing" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("conferences").update({
    name,
    abbreviation,
    url,
    location,
    start_date,
    end_date: end_date || null,
    category,
    tier,
    topics,
    notes,
  }).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  redirect("/admin/conferences");
}

export async function deleteConference(id: string) {
  const supabase = await createClient();
  await supabase.from("conferences").delete().eq("id", id);
  redirect("/admin/conferences");
}
