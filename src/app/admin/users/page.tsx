import { Topbar } from "@/components/admin/Topbar";
import { EmptyState } from "@/components/admin/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { UserManagementClient, InviteUserForm } from "./UserManagementClient";

export const dynamic = "force-dynamic";

async function getUsers() {
  try {
    const { createClient: createAdminClient } = await import("@supabase/supabase-js");
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );
    const { data } = await admin.auth.admin.listUsers();
    return data?.users ?? [];
  } catch {
    return [];
  }
}

export default async function UsersPage() {
  const { lang, t } = await getDict();
  const users = await getUsers();

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: "Users" }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">Users</p>
          <p className="mt-4 max-w-2xl text-[13.5px] text-ink-500">Manage admin users</p>
        </header>

        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-line bg-paper/30 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{users.length} users</span>
            <InviteUserForm />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line bg-paper/30 text-left">
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Email</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Created</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Last Sign In</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.length === 0 ? (
                  <tr><td colSpan={5}><EmptyState title="No users" description="No admin users found" compact /></td></tr>
                ) : users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-4 py-3 text-ink-800">{u.email}</td>
                    <td className="px-4 py-3 text-ink-600 font-mono text-[12px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-ink-600 font-mono text-[12px]">
                      {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-[0.1em] ${u.banned_until ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {u.banned_until ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Suspense>
                        <UserManagementClient userId={u.id} email={u.email} />
                      </Suspense>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
