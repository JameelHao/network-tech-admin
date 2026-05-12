"use client";

import { useTransition } from "react";
import { setLang } from "@/lib/i18n/actions";
import type { Lang } from "@/lib/i18n/dict";
import { tabClass } from "@/lib/admin/ui";

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
        className={tabClass(lang === "zh", "sm")}
      >
        中
      </button>
      <button
        type="button"
        onClick={() => pick("en")}
        aria-pressed={lang === "en"}
        className={tabClass(lang === "en", "sm")}
      >
        EN
      </button>
    </div>
  );
}
