import { Fragment } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";
import { LogoutButton } from "./LogoutButton";
import { MobileNavToggle } from "./MobileNav";
import type { Dict, Lang } from "@/lib/i18n/dict";

export function Topbar({ crumbs, t, lang }: { crumbs: { label: string; href?: string }[]; t: Dict; lang: Lang }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="flex h-14 items-center gap-3 lg:gap-6 px-4 sm:px-6 xl:px-10">
        <MobileNavToggle />

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
          <ThemeToggle t={t} />
          <LangToggle lang={lang} />
          <LogoutButton t={t} />
        </div>
      </div>
    </header>
  );
}
