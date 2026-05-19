"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Dict, Lang } from "@/lib/i18n/dict";
import { ConferenceForm } from "./ConferenceForm";

export function ConferenceCreateModal({ t, lang }: { t: Dict; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = buttonRef.current;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeydown);
    window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeydown);
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-navy-700 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-navy-50 hover:bg-navy-600 transition-colors"
      >
        + {t.conf.addNew}
      </button>
      {open && typeof document !== "undefined" ? createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="conference-create-title"
          className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-ink-900/50 px-4 py-6"
          onClick={() => setOpen(false)}
        >
          <div
            ref={panelRef}
            className="flex max-h-[calc(100dvh-48px)] w-[760px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-[0_24px_70px_-32px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-[58px] shrink-0 items-center justify-between gap-3 border-b border-line px-5">
              <div>
                <p className="tracked-label">{t.nav.conferences}</p>
                <h2 id="conference-create-title" className="font-sans text-[15px] font-semibold tracking-tight text-ink-900">
                  {t.conf.addNew}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-[18px] leading-none text-ink-400 hover:bg-paper hover:text-ink-700"
                aria-label={t.conf.cancel}
              >
                x
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <ConferenceForm t={t} lang={lang} compact />
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
