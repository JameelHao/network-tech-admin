"use client";

import { useState } from "react";

type Props = {
  label: string;
  activeCount?: number;
  children: React.ReactNode;
};

export function MobileFilterPanel({ label, activeCount = 0, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md border border-line px-3 min-h-[36px] text-[12px] text-ink-600 hover:border-line-strong transition-colors"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          <path d="M1.5 3.5h13M3.5 8h9M5.5 12.5h5" />
        </svg>
        {label}
        {activeCount > 0 && (
          <span className="ml-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-navy-600 px-1 font-mono text-[10px] leading-none text-white">
            {activeCount}
          </span>
        )}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-3 rounded-lg border border-line bg-paper/50 p-4">
          {children}
        </div>
      )}
    </div>
  );
}
