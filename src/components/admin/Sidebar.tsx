"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useCallback, useState } from "react";
import type { Dict } from "@/lib/i18n/dict";

type Item = { href: string; label: string };
type Section = { label: string; items: Item[] };

export function Sidebar({ t }: { t: Dict }) {
  const pathname = usePathname();

  const sections: Section[] = useMemo(() => [
    {
      label: t.nav.overview,
      items: [
        { href: "/admin", label: t.nav.dashboard },
        { href: "/admin/topics", label: t.nav.topics },
        { href: "/admin/favorites", label: t.nav.favorites },
        { href: "/admin/companies", label: t.nav.companies },
        { href: "/admin/users", label: "Users" },
      ],
    },
    {
      label: t.nav.insights,
      items: [
        { href: "/admin/conferences", label: t.nav.conferences },
        { href: "/admin/papers", label: t.nav.papers },
        { href: "/admin/opensource", label: t.nav.opensource },
        { href: "/admin/products", label: t.nav.products },
        { href: "/admin/news", label: t.nav.news },
        { href: "/admin/rfcs", label: t.nav.rfcs },
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
  ], [t]);

  const isActive = useCallback((href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }, [pathname]);

  const sectionHasActive = useCallback((items: Item[]) =>
    items.some((i) => isActive(i.href)),
    [isActive],
  );

  const renderItems = useCallback((items: Item[]) => (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            style={{ fontWeight: 400 }}
            className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-navy-50 transition-colors focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none ${
              active
                ? "bg-navy-500/60"
                : "hover:bg-navy-500/20"
            }`}
          >
            {active && <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-gold-400 shadow-[0_0_6px_rgba(250,204,21,0.4)]" />}
            <span className="flex-1 min-w-0 truncate text-[15px] font-normal" style={{ fontWeight: 400 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  ), [isActive]);

  return (
    <SidebarNav sections={sections} sectionHasActive={sectionHasActive} renderItems={renderItems} t={t} />
  );
}

function Chevron() {
  return (
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
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[10px] font-normal uppercase tracking-[0.22em] text-gold-300/70" style={{ fontWeight: 400 }}>{children}</span>;
}

const summaryClass =
  "flex items-center justify-between rounded-md px-3 py-2 cursor-pointer list-none font-normal text-navy-50 [&::-webkit-details-marker]:hidden hover:bg-navy-500/20 hover:text-navy-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 select-none";

function SidebarNav({
  sections,
  sectionHasActive,
  renderItems,
  t,
}: {
  sections: Section[];
  sectionHasActive: (items: Item[]) => boolean;
  renderItems: (items: Item[]) => React.ReactNode;
  t: Dict;
}) {
  const navContent = (variant: "desktop" | "mobile") => {
    const isMobile = variant === "mobile";
    return (
      <div className={isMobile ? "px-3 pb-6 flex flex-col" : "px-3 flex-1 overflow-y-auto"}>
        {sections.map((section) => {
          const sectionOpen = sectionHasActive(section.items);
          return isMobile ? (
            <MobileNavSection key={section.label} label={section.label} defaultOpen={sectionOpen}>
              <div className="mt-1 pb-2">{renderItems(section.items)}</div>
            </MobileNavSection>
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
          <span className="font-sans text-[17px] font-semibold tracking-tight text-navy-50">Tech Radar</span>
        </div>
        {navContent("desktop")}
      </aside>

      <div
        id="admin-mobile-nav-backdrop"
        data-mobile-nav-backdrop
        aria-hidden
        className="lg:hidden hidden [&.is-open]:block fixed inset-0 top-14 z-40 bg-ink-900/50"
      />
      <div
        id="admin-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-hidden="true"
        tabIndex={-1}
        className="lg:hidden hidden [&.is-open]:flex flex-col fixed left-0 right-0 top-14 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto bg-gradient-to-b from-navy-700 to-navy-900 text-navy-50 border-b border-navy-500/30 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)]"
      >
        <div className="px-5 pt-5 pb-3">
          <span className="font-sans text-[15px] font-semibold tracking-tight text-navy-50">Tech Radar</span>
        </div>
        {navContent("mobile")}
      </div>
    </>
  );
}

function MobileNavSection({ label, defaultOpen, children }: { label: string; defaultOpen: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-1 group">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`${summaryClass} w-full`}
      >
        <Eyebrow>{label}</Eyebrow>
        <Chevron />
      </button>
      {open && children}
    </div>
  );
}
