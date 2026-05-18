"use client";

import { useEffect } from "react";

export function AppBootstrap() {
  useEffect(() => {
    try {
      const theme = localStorage.getItem("nt-theme");
      if (theme === "dark" || (theme !== "light" && matchMedia("(prefers-color-scheme:dark)").matches)) {
        document.documentElement.classList.add("dark");
      }
    } catch {
      // Ignore storage/media errors during bootstrap.
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
