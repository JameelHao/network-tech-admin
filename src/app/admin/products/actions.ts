"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type ProductFormState = { error?: string; success?: boolean } | undefined;

export async function createProductAction(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const name = formData.get("name") as string;
  const vendor = (formData.get("vendor") as string) || null;
  const category = (formData.get("category") as string) || "other";
  const description = (formData.get("description") as string) || null;
  const url = (formData.get("url") as string) || null;
  const changelog_url = (formData.get("changelog_url") as string) || null;
  const latest_version = (formData.get("latest_version") as string) || null;
  const release_date = (formData.get("release_date") as string) || null;
  const pricing = (formData.get("pricing") as string) || "unknown";
  const topics = (formData.get("topics") as string)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const stage = (formData.get("stage") as string) || "watching";
  const notes = (formData.get("notes") as string) || null;

  if (!name) {
    return { error: "Name is required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    name,
    vendor,
    category,
    description,
    url,
    changelog_url,
    latest_version,
    release_date: release_date || null,
    pricing,
    topics,
    stage,
    notes,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const vendor = (formData.get("vendor") as string) || null;
  const category = (formData.get("category") as string) || "other";
  const description = (formData.get("description") as string) || null;
  const url = (formData.get("url") as string) || null;
  const changelog_url = (formData.get("changelog_url") as string) || null;
  const latest_version = (formData.get("latest_version") as string) || null;
  const release_date = (formData.get("release_date") as string) || null;
  const pricing = (formData.get("pricing") as string) || "unknown";
  const topics = (formData.get("topics") as string)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const stage = (formData.get("stage") as string) || "watching";
  const notes = (formData.get("notes") as string) || null;

  if (!id || !name) {
    return { error: "Required fields missing" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").update({
    name,
    vendor,
    category,
    description,
    url,
    changelog_url,
    latest_version,
    release_date: release_date || null,
    pricing,
    topics,
    stage,
    notes,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
