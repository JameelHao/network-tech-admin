import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const expectedBypass =
  process.env.ADMIN_DEV_PASSWORD ||
  (process.env.NODE_ENV !== "production" ? "admin" : null);

export async function requireAdminAuth(): Promise<NextResponse | null> {
  // Dev bypass cookie check (same logic as middleware)
  if (expectedBypass) {
    const cookieStore = await cookies();
    const bypassCookie = cookieStore.get("dev-bypass")?.value;
    if (bypassCookie === expectedBypass) return null;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
