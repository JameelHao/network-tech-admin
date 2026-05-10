"use client";

import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";
import { LogoutButton } from "./LogoutButton";
import type { Dict, Lang } from "@/lib/i18n/dict";

export function TopbarActions({ t, lang }: { t: Dict; lang: Lang }) {
  return (
    <div className="ml-auto flex items-center gap-3">
      <ThemeToggle t={t} />
      <LangToggle lang={lang} />
      <LogoutButton t={t} />
    </div>
  );
}
