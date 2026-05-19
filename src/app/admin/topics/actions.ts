"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { TOPIC_CATEGORIES, type TopicCategory } from "@/lib/admin/topics";

export type TopicFormState = { error?: string; success?: boolean; category?: TopicCategory } | undefined;

const CATEGORY_KEYS = Object.keys(TOPIC_CATEGORIES) as TopicCategory[];

function normalizeSlug(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readTopicForm(formData: FormData) {
  return {
    originalSlug: normalizeSlug(formData.get("originalSlug")),
    slug: normalizeSlug(formData.get("slug")),
    category: String(formData.get("category") ?? "") as TopicCategory,
    en: String(formData.get("en") ?? "").trim(),
    zh: String(formData.get("zh") ?? "").trim(),
  };
}

function validateTopic(input: ReturnType<typeof readTopicForm>) {
  if (!input.slug || !input.en || !input.zh) {
    return "Slug, English label and Chinese label are required";
  }
  if (!CATEGORY_KEYS.includes(input.category)) {
    return "Invalid topic category";
  }
  return null;
}

async function topicIsReferenced(slug: string) {
  const supabase = await createClient();
  const checks = await Promise.all([
    supabase.from("paper_topics").select("paper_id", { count: "exact", head: true }).eq("topic_slug", slug),
    supabase.from("conferences").select("id", { count: "exact", head: true }).contains("topics", [slug]),
    supabase.from("talent_leads").select("id", { count: "exact", head: true }).contains("topics", [slug]),
    supabase.from("opensource").select("id", { count: "exact", head: true }).contains("topics", [slug]),
    supabase.from("products").select("id", { count: "exact", head: true }).contains("topics", [slug]),
    supabase.from("vendors").select("id", { count: "exact", head: true }).contains("topics", [slug]),
  ]);

  return checks.some((result) => (result.count ?? 0) > 0);
}

export async function createTopicAction(_prev: TopicFormState, formData: FormData): Promise<TopicFormState> {
  const input = readTopicForm(formData);
  const validation = validateTopic(input);
  if (validation) return { error: validation };

  const supabase = await createClient();
  const { error } = await supabase.from("admin_topics").insert({
    slug: input.slug,
    category: input.category,
    en: input.en,
    zh: input.zh,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/topics");
  return { success: true, category: input.category };
}

export async function updateTopicAction(_prev: TopicFormState, formData: FormData): Promise<TopicFormState> {
  const input = readTopicForm(formData);
  const validation = validateTopic(input);
  if (validation) return { error: validation };
  if (!input.originalSlug) return { error: "Original slug is required" };
  if (input.originalSlug !== input.slug && await topicIsReferenced(input.originalSlug)) {
    return { error: "Referenced topics cannot change slug. Update the label/category instead." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("admin_topics")
    .update({
      slug: input.slug,
      category: input.category,
      en: input.en,
      zh: input.zh,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", input.originalSlug);

  if (error) return { error: error.message };

  revalidatePath("/admin/topics");
  return { success: true, category: input.category };
}

export async function deleteTopicAction(_prev: TopicFormState, formData: FormData): Promise<TopicFormState> {
  const slug = normalizeSlug(formData.get("slug"));
  if (!slug) return { error: "Topic slug is required" };
  if (await topicIsReferenced(slug)) {
    return { error: "Referenced topics cannot be deleted. Remove it from related items first." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("admin_topics").delete().eq("slug", slug);
  if (error) return { error: error.message };

  revalidatePath("/admin/topics");
  return { success: true };
}
