import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";

export const dynamic = "force-dynamic";

async function getAdminClient() {
  const supabase = await createClient();
  // Use service_role key for admin operations
  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function GET() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const admin = await getAdminClient();
  const { data: users, error } = await admin.auth.admin.listUsers();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const body = await request.json();
  const { email, password } = body;
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const admin = await getAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: password || undefined,
    email_confirm: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  const admin = await getAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
