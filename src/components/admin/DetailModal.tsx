"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function DetailModal({
  title,
  label,
  children,
  onClose,
  width,
}: {
  title: string;
  label: string;
  children: ReactNode;
  onClose: () => void;
  width?: string;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeydown);

    window.requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-ink-900/50 px-4 py-6"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        style={{ width: width ?? "min(90vw, 900px)" }}
        className="flex max-h-[calc(100dvh-48px)] flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)] outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-[58px] shrink-0 items-center justify-between gap-3 border-b border-line px-5">
          <div className="min-w-0">
            <p className="tracked-label">{label}</p>
            <h2 id="detail-modal-title" className="font-sans text-[15px] font-semibold tracking-tight text-ink-900 truncate pr-2">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-[18px] leading-none text-ink-400 hover:bg-paper hover:text-ink-700"
            aria-label="Close"
          >
            x
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 space-y-5">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
