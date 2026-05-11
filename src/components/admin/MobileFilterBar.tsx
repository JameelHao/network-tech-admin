"use client";

import { useState } from "react";

export function MobileFilterBar({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="lg:hidden flex items-center gap-1.5 rounded-md border border-line px-3 min-h-[36px] text-[12px] text-ink-600 hover:border-line-strong transition-colors"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          <path d="M1.5 3.5h13M3.5 8h9M5.5 12.5h5" />
        </svg>
        {label}
      </button>
      <div
        className={`${open ? "flex" : "hidden"} lg:flex flex-wrap items-center gap-2 w-full lg:w-auto`}
      >
        {children}
      </div>
    </>
  );
}
