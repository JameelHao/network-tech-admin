"use client";

import { Fragment, useCallback, useEffect, useState, useTransition } from "react";
import { setLang } from "@/lib/i18n/actions";
import { logout } from "@/app/login/actions";
import type { Dict, Lang } from "@/lib/i18n/dict";

type Mode = "light" | "dark" | "system";
const STORAGE_KEY = "nt-theme";

function applyTheme(mode: Mode) {
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function Topbar({ crumbs, t, lang }: { crumbs: { label: string; href?: string }[]; t: Dict; lang: Lang }) {
  const [mode, setMode] = useState<Mode>("system");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Mode | null;
    if (stored === "light" || stored === "dark") setMode(stored);
  }, []);

  useEffect(() => {
    applyTheme(mode);
    if (mode === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = () => applyTheme("system");
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [mode]);

  const cycleTheme = useCallback(() => {
    setMode((prev) => {
      const order: Mode[] = ["light", "dark", "system"];
      return order[(order.indexOf(prev) + 1) % 3];
    });
  }, []);

  function pickLang(next: Lang) {
    if (next === lang) return;
    startTransition(() => setLang(next));
  }

  const themeLabel = { light: t.topbar.themeLight, dark: t.topbar.themeDark, system: t.topbar.themeSystem }[mode];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="flex h-14 items-center gap-3 lg:gap-6 px-4 sm:px-6 xl:px-10">
        {/* Hamburger - uses inline script from layout */}
        <button
          type="button"
          aria-label="Menu"
          aria-expanded="false"
          aria-controls="admin-mobile-nav"
          data-mobile-nav-trigger
          className="lg:hidden -ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-700 hover:bg-ink-100 transition-colors"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 6H17" />
            <path d="M3 10H17" />
            <path d="M3 14H17" />
          </svg>
        </button>

        <a href="/admin" className="lg:hidden inline-flex items-center gap-2 min-w-0">
          <span className="font-display text-[14px] font-semibold tracking-tight text-ink-900 truncate">
            Tech Radar
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-1.5 text-sm text-ink-500">
          {crumbs.map((c, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="text-ink-300">/</span>}
              {c.href ? (
                <a href={c.href} className="hover:text-ink-800 transition-colors">{c.label}</a>
              ) : (
                <span className="text-ink-800 font-medium">{c.label}</span>
              )}
            </Fragment>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={cycleTheme}
            className="flex h-8 items-center gap-1.5 rounded-full px-2 text-ink-500 hover:text-ink-800 hover:bg-ink-100 transition-colors"
            aria-label={themeLabel}
            title={themeLabel}
          >
            {mode === "light" && (
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                <circle cx="8" cy="8" r="3" />
                <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
              </svg>
            )}
            {mode === "dark" && (
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                <path d="M13.2 9.8A5.5 5.5 0 0 1 6.2 2.8a5.5 5.5 0 1 0 7 7z" />
              </svg>
            )}
            {mode === "system" && (
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2.5" width="12" height="8" rx="1" />
                <path d="M5.5 13.5h5M8 10.5v3" />
              </svg>
            )}
            <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.14em]">{themeLabel}</span>
          </button>

          {/* Lang toggle */}
          <div
            role="group"
            aria-label="Language"
            className={`inline-flex items-center rounded bg-surface/60 p-0.5 ${pending ? "opacity-60" : ""}`}
          >
            <button
              type="button"
              onClick={() => pickLang("zh")}
              aria-pressed={lang === "zh"}
              className={`px-2 py-0.5 rounded font-mono text-[10.5px] tracking-[0.14em] uppercase transition-colors ${
                lang === "zh" ? "bg-navy-700 text-navy-50" : "text-ink-500 hover:text-ink-800"
              }`}
            >
              中
            </button>
            <button
              type="button"
              onClick={() => pickLang("en")}
              aria-pressed={lang === "en"}
              className={`px-2 py-0.5 rounded font-mono text-[10.5px] tracking-[0.14em] uppercase transition-colors ${
                lang === "en" ? "bg-navy-700 text-navy-50" : "text-ink-500 hover:text-ink-800"
              }`}
            >
              EN
            </button>
          </div>

          {/* Logout */}
          <form action={logout}>
            <button
              type="submit"
              className="flex h-8 items-center rounded-full px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 hover:text-ink-800 hover:bg-ink-100 transition-colors"
            >
              {t.topbar.signOut}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
