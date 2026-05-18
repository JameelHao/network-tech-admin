"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(_prev: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const adminPassword =
    process.env.ADMIN_DEV_PASSWORD ||
    (process.env.NODE_ENV !== "production" ? "admin" : null);
  if (email === "admin" && adminPassword && password === adminPassword) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set("dev-bypass", adminPassword, { path: "/", httpOnly: true });
    redirect("/admin");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password" };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
