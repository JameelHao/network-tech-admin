"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dict } from "@/lib/i18n/dict";

type Item = { href: string; label: string };
type Section = { label: string; items: Item[] };

export function Sidebar({ t }: { t: Dict }) {
  const pathname = usePathname();

  const sections: Section[] = [
    {
      label: t.nav.overview,
      items: [
        { href: "/admin", label: t.nav.dashboard },
        { href: "/admin/insights", label: t.nav.insights },
        { href: "/admin/topics", label: t.nav.topics },
      ],
    },
    {
      label: t.nav.insights,
      items: [
        { href: "/admin/conferences", label: t.nav.conferences },
        { href: "/admin/papers", label: t.nav.papers },
        { href: "/admin/opensource", label: t.nav.opensource },
        { href: "/admin/news", label: t.nav.news },
        { href: "/admin/jobs", label: t.nav.jobs },
      ],
    },
    {
      label: t.nav.followUp,
      items: [
        { href: "/admin/leads", label: t.nav.leads },
        { href: "/admin/talents", label: t.nav.talents },
      ],
    },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sectionHasActive = (items: Item[]) => items.some((i) => isActive(i.href));

  const renderItems = (items: Item[]) => (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-md px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none ${
              active ? "bg-navy-500/40 text-navy-50" : "text-navy-200 hover:text-navy-50 hover:bg-navy-500/20"
            }`}
          >
            {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-gold-400" />}
            <span className="flex-1 min-w-0 truncate text-[15px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const Chevron = () => (
    <svg
      viewBox="0 0 12 12"
      className="h-3 w-3 shrink-0 text-gold-300/70 transition-transform group-open:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M3 4.5 L6 7.5 L9 4.5" />
    </svg>
  );

  const Eyebrow = ({ children }: { children: React.ReactNode }) => (
    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold-300/70">{children}</span>
  );

  const summaryClass =
    "flex items-center justify-between rounded-md px-3 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-navy-500/20 select-none";

  const navContent = (variant: "desktop" | "mobile") => {
    const isMobile = variant === "mobile";
    return (
      <div className={isMobile ? "px-3 pb-6 flex flex-col" : "px-3 flex-1 overflow-y-auto"}>
        {sections.map((section) => {
          const sectionOpen = sectionHasActive(section.items);
          return isMobile ? (
            <details key={section.label} open={sectionOpen} className="mb-1 group">
              <summary className={summaryClass}>
                <Eyebrow>{section.label}</Eyebrow>
                <Chevron />
              </summary>
              <div className="mt-1 pb-2">{renderItems(section.items)}</div>
            </details>
          ) : (
            <div key={section.label} className="mb-7">
              <div className="px-3 pb-2.5"><Eyebrow>{section.label}</Eyebrow></div>
              {renderItems(section.items)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <aside aria-label={t.a11y.navigation} className="hidden lg:flex flex-col w-[252px] shrink-0 bg-gradient-to-b from-navy-700 to-navy-900 text-navy-50">
        <div className="px-6 pt-7 pb-9">
          <span className="font-display text-[17px] font-semibold tracking-tight">Tech Radar</span>
        </div>
        {navContent("desktop")}
      </aside>

      <div
        id="admin-mobile-nav-backdrop"
        data-mobile-nav-backdrop
        aria-hidden
        className="lg:hidden hidden [&.is-open]:block fixed inset-0 top-14 z-30 bg-ink-900/50"
      />
      <div
        id="admin-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-hidden="true"
        className="lg:hidden hidden [&.is-open]:flex flex-col fixed left-0 right-0 top-14 z-40 max-h-[calc(100dvh-3.5rem)] overflow-y-auto bg-gradient-to-b from-navy-700 to-navy-900 text-navy-50 border-b border-navy-500/30 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)]"
      >
        <div className="px-5 pt-5 pb-3">
          <span className="font-display text-[15px] font-semibold tracking-tight">Tech Radar</span>
        </div>
        {navContent("mobile")}
      </div>
    </>
  );
}
