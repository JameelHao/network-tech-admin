"use client";

import { useState, useRef, useEffect } from "react";

export function OverflowMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center justify-center rounded-md border border-line px-2 min-h-[36px] text-[14px] text-ink-600 hover:border-line-strong transition-colors"
      >
        ···
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 flex flex-col gap-1 rounded-lg border border-line bg-surface p-2 shadow-md min-w-[160px]">
          {children}
        </div>
      )}
    </div>
  );
}
