"use client";

import { useTransition } from "react";
import { setLang } from "@/lib/i18n/actions";
import type { Lang } from "@/lib/i18n/dict";

export function LangToggle({ lang }: { lang: Lang }) {
  const [pending, start] = useTransition();

  function pick(next: Lang) {
    if (next === lang) return;
    start(() => setLang(next));
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-md border border-line bg-surface p-0.5 ${pending ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        onClick={() => pick("zh")}
        aria-pressed={lang === "zh"}
        className={`px-2 py-0.5 rounded font-mono text-[10.5px] tracking-[0.14em] uppercase transition-colors ${
          lang === "zh" ? "bg-navy-700 text-navy-50" : "text-ink-500 hover:text-ink-800"
        }`}
      >
        中
      </button>
      <button
        type="button"
        onClick={() => pick("en")}
        aria-pressed={lang === "en"}
        className={`px-2 py-0.5 rounded font-mono text-[10.5px] tracking-[0.14em] uppercase transition-colors ${
          lang === "en" ? "bg-navy-700 text-navy-50" : "text-ink-500 hover:text-ink-800"
        }`}
      >
        EN
      </button>
    </div>
  );
}
