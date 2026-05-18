import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const body = await request.json().catch(() => ({}));
  const supabase = await createClient();

  await supabase.from("sync_meta").upsert(
    {
      entity: "papers",
      last_sync_at: new Date().toISOString(),
      last_result: { categoryStats: body.categoryStats ?? [] },
    },
    { onConflict: "entity" },
  );

  return NextResponse.json({ ok: true });
}
