"use client";

import { logout } from "@/app/login/actions";
import type { Dict } from "@/lib/i18n/dict";

export function LogoutButton({ t }: { t: Dict }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex h-8 items-center rounded-full px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 hover:text-ink-800 hover:bg-ink-100 transition-colors"
      >
        {t.topbar.signOut}
      </button>
    </form>
  );
}
