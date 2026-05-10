"use client";

import { useActionState } from "react";
import { login } from "@/app/login/actions";
import type { Dict } from "@/lib/i18n/dict";

export function LoginForm({ t }: { t: Dict }) {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1.5">
          {t.login.email}
        </label>
        <input
          id="email"
          name="email"
          type="text"
          autoComplete="email"
          required
          className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
        />
      </div>
      <div>
        <label htmlFor="password" className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1.5">
          {t.login.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
        />
      </div>

      {state?.error && (
        <div className="rounded-md border border-rust-100 bg-rust-50 px-3 py-2 text-[12.5px] text-rust-700">
          <span className="font-mono uppercase tracking-[0.16em] text-[10px] mr-2">Error</span>
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-navy-700 px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-paper hover:bg-navy-600 disabled:opacity-60 disabled:cursor-progress transition-colors"
      >
        {pending ? t.login.submitting : t.login.submit}
      </button>
    </form>
  );
}
