"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type VendorFormState = { error?: string; success?: boolean } | undefined;

export async function createVendorAction(_prev: VendorFormState, formData: FormData): Promise<VendorFormState> {
  const name = formData.get("name") as string;
  const type = (formData.get("type") as string) || "vendor";
  const website = (formData.get("website") as string) || null;
  const description = (formData.get("description") as string) || null;
  const hq_location = (formData.get("hq_location") as string) || null;
  const founded_year_str = formData.get("founded_year") as string;
  const founded_year = founded_year_str ? parseInt(founded_year_str, 10) : null;
  const employee_range = (formData.get("employee_range") as string) || null;
  const key_products = (formData.get("key_products") as string)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const topics = (formData.get("topics") as string)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const stage = (formData.get("stage") as string) || "watching";
  const notes = (formData.get("notes") as string) || null;

  if (!name) {
    return { error: "Name is required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("vendors").insert({
    name,
    type,
    website,
    description,
    hq_location,
    founded_year: Number.isNaN(founded_year) ? null : founded_year,
    employee_range,
    key_products,
    topics,
    stage,
    notes,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/vendors");
  redirect("/admin/vendors");
}

export async function updateVendorAction(_prev: VendorFormState, formData: FormData): Promise<VendorFormState> {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const type = (formData.get("type") as string) || "vendor";
  const website = (formData.get("website") as string) || null;
  const description = (formData.get("description") as string) || null;
  const hq_location = (formData.get("hq_location") as string) || null;
  const founded_year_str = formData.get("founded_year") as string;
  const founded_year = founded_year_str ? parseInt(founded_year_str, 10) : null;
  const employee_range = (formData.get("employee_range") as string) || null;
  const key_products = (formData.get("key_products") as string)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const topics = (formData.get("topics") as string)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const stage = (formData.get("stage") as string) || "watching";
  const notes = (formData.get("notes") as string) || null;

  if (!id || !name) {
    return { error: "Required fields missing" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("vendors").update({
    name,
    type,
    website,
    description,
    hq_location,
    founded_year: Number.isNaN(founded_year) ? null : founded_year,
    employee_range,
    key_products,
    topics,
    stage,
    notes,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/vendors");
  redirect("/admin/vendors");
}

export async function deleteVendor(id: string) {
  const supabase = await createClient();
  await supabase.from("vendors").delete().eq("id", id);
  revalidatePath("/admin/vendors");
  redirect("/admin/vendors");
}
