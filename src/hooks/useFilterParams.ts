"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useFilterParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const get = useCallback(
    (key: string) => searchParams.get(key) ?? "",
    [searchParams],
  );

  /** Get multi-value param (comma-separated or repeated keys) */
  const getAll = useCallback(
    (key: string): string[] => {
      const vals = searchParams.getAll(key);
      if (vals.length === 1 && vals[0].includes(",")) return vals[0].split(",").filter(Boolean);
      return vals.filter(Boolean);
    },
    [searchParams],
  );

  /** Toggle a value in a multi-value param */
  const toggle = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get(key) ?? "";
      const vals = current ? current.split(",") : [];
      const idx = vals.indexOf(value);
      if (idx >= 0) vals.splice(idx, 1);
      else vals.push(value);
      if (vals.length > 0) params.set(key, vals.join(","));
      else params.delete(key);
      params.delete("page");
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  /** Check if a value is selected in a multi-value param */
  const has = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key) ?? "";
      return current.split(",").includes(value);
    },
    [searchParams],
  );

  const set = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const remove = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      params.delete("page");
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const activeEntries = useMemo(() => {
    const entries: { key: string; value: string }[] = [];
    const skip = new Set(["page", "size", "sort", "dir"]);
    searchParams.forEach((v, k) => {
      if (!skip.has(k)) entries.push({ key: k, value: v });
    });
    return entries;
  }, [searchParams]);

  return { get, getAll, toggle, has, set, remove, clearAll, activeEntries, searchParams };
}
