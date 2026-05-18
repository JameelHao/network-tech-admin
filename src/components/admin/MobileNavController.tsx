"use client";

import { useEffect } from "react";

export function MobileNavController() {
  useEffect(() => {
    function setOpen(open: boolean) {
      const nav = document.getElementById("admin-mobile-nav");
      const backdrop = document.getElementById("admin-mobile-nav-backdrop");
      nav?.classList.toggle("is-open", open);
      backdrop?.classList.toggle("is-open", open);
      nav?.setAttribute("aria-hidden", String(!open));
      document.querySelectorAll("[data-mobile-nav-trigger]").forEach((el) => {
        el.setAttribute("aria-expanded", String(open));
      });
      document.body.style.overflow = open ? "hidden" : "";
    }

    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      if (target.closest("[data-mobile-nav-trigger]")) {
        event.preventDefault();
        const nav = document.getElementById("admin-mobile-nav");
        setOpen(!nav?.classList.contains("is-open"));
        return;
      }

      if (target.closest("[data-mobile-nav-backdrop]") || target.closest("#admin-mobile-nav a")) {
        setOpen(false);
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
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
