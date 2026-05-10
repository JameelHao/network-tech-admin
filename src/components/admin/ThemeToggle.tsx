"use client";

import { useCallback, useEffect, useState } from "react";
import type { Dict } from "@/lib/i18n/dict";

type Mode = "light" | "dark" | "system";

const STORAGE_KEY = "nt-theme";

function applyTheme(mode: Mode) {
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle({ t }: { t: Dict }) {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Mode | null;
    if (stored === "light" || stored === "dark") {
      setMode(stored);
    }
  }, []);

  useEffect(() => {
    applyTheme(mode);
    if (mode === "system") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const cycle = useCallback(() => {
    setMode((prev) => {
      const order: Mode[] = ["light", "dark", "system"];
      return order[(order.indexOf(prev) + 1) % 3];
    });
  }, []);

  const label = { light: t.topbar.themeLight, dark: t.topbar.themeDark, system: t.topbar.themeSystem }[mode];

  return (
    <button
      type="button"
      onClick={cycle}
      className="flex h-8 items-center gap-1.5 rounded-full px-2 text-ink-500 hover:text-ink-800 hover:bg-ink-100 transition-colors"
      aria-label={label}
      title={label}
    >
      {mode === "light" && <SunIcon />}
      {mode === "dark" && <MoonIcon />}
      {mode === "system" && <MonitorIcon />}
      <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.14em]">{label}</span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M13.2 9.8A5.5 5.5 0 0 1 6.2 2.8a5.5 5.5 0 1 0 7 7z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2.5" width="12" height="8" rx="1" />
      <path d="M5.5 13.5h5M8 10.5v3" />
    </svg>
  );
}
