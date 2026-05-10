"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type TalentFormState = { error?: string; success?: boolean } | undefined;

export async function createTalent(_prev: TalentFormState, formData: FormData): Promise<TalentFormState> {
  const name = formData.get("name") as string;
  const role = (formData.get("role") as string) || null;
  const company = (formData.get("company") as string) || null;
  const linkedin_url = (formData.get("linkedin_url") as string) || null;
  const source = (formData.get("source") as string) || null;
  const topics = (formData.get("topics") as string)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const stage = (formData.get("stage") as string) || "new";
  const notes = (formData.get("notes") as string) || null;

  if (!name) {
    return { error: "Name is required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("talent_leads").insert({
    name,
    role,
    company,
    linkedin_url,
    source,
    topics,
    stage,
    notes,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/talents");
  redirect("/admin/talents");
}

export async function updateTalent(_prev: TalentFormState, formData: FormData): Promise<TalentFormState> {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const role = (formData.get("role") as string) || null;
  const company = (formData.get("company") as string) || null;
  const linkedin_url = (formData.get("linkedin_url") as string) || null;
  const source = (formData.get("source") as string) || null;
  const topics = (formData.get("topics") as string)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const stage = (formData.get("stage") as string) || "new";
  const notes = (formData.get("notes") as string) || null;

  if (!id || !name) {
    return { error: "Required fields missing" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("talent_leads").update({
    name,
    role,
    company,
    linkedin_url,
    source,
    topics,
    stage,
    notes,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/talents");
  redirect("/admin/talents");
}

export async function deleteTalent(id: string) {
  const supabase = await createClient();
  await supabase.from("talent_leads").delete().eq("id", id);
  revalidatePath("/admin/talents");
  redirect("/admin/talents");
}
