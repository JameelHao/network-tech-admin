"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "summary",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function MobileNavController() {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function getNav() {
      return document.getElementById("admin-mobile-nav");
    }

    function getFocusable(nav: HTMLElement) {
      return Array.from(nav.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      });
    }

    function focusFirstItem(nav: HTMLElement) {
      const active = nav.querySelector<HTMLElement>('a[aria-current="page"]');
      const first = active ?? getFocusable(nav)[0];
      first?.focus({ preventScroll: true });
    }

    function setOpen(open: boolean, trigger?: HTMLElement | null) {
      const nav = document.getElementById("admin-mobile-nav");
      const backdrop = document.getElementById("admin-mobile-nav-backdrop");
      if (open && trigger) triggerRef.current = trigger;

      nav?.classList.toggle("is-open", open);
      backdrop?.classList.toggle("is-open", open);
      nav?.setAttribute("aria-hidden", String(!open));
      document.querySelectorAll("[data-mobile-nav-trigger]").forEach((el) => {
        el.setAttribute("aria-expanded", String(open));
      });
      document.body.style.overflow = open ? "hidden" : "";

      if (open && nav) {
        window.requestAnimationFrame(() => focusFirstItem(nav));
      } else if (!open) {
        triggerRef.current?.focus({ preventScroll: true });
      }
    }

    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const trigger = target.closest<HTMLElement>("[data-mobile-nav-trigger]");
      if (trigger) {
        event.preventDefault();
        const nav = getNav();
        setOpen(!nav?.classList.contains("is-open"), trigger);
        return;
      }

      if (target.closest("[data-mobile-nav-backdrop]") || target.closest("#admin-mobile-nav a")) {
        setOpen(false);
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      const nav = getNav();
      const isOpen = !!nav?.classList.contains("is-open");
      if (!isOpen || !nav) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable(nav);
      if (focusable.length === 0) {
        event.preventDefault();
        nav.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "";
    };
  }, []);

  return null;
}
