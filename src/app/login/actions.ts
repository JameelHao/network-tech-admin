"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(_prev: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Dev bypass
  if (email === "admin" && password === "admin") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set("dev-bypass", "1", { path: "/", httpOnly: true });
    redirect("/admin");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "邮箱或密码错误" };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
