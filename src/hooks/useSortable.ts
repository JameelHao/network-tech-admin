import { useState, useMemo } from "react";
import type { SortDir } from "@/lib/admin/pagination";

export type SortState = {
  key: string | null;
  dir: SortDir | null;
};

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function useSortable<T extends Record<string, unknown>>(
  data: T[],
  defaultSort?: { key: string; dir: SortDir },
) {
  const [sortState, setSortState] = useState<SortState>({
    key: defaultSort?.key ?? null,
    dir: defaultSort?.dir ?? null,
  });

  const sorted = useMemo(() => {
    if (!sortState.key || !sortState.dir) return data;
    const k = sortState.key;
    const mult = sortState.dir === "asc" ? 1 : -1;
    return [...data].sort((a, b) => mult * compare(a[k], b[k]));
  }, [data, sortState.key, sortState.dir]);

  const onSort = (col: string, dir: SortDir | null) => {
    setSortState({ key: dir ? col : null, dir });
  };

  return {
    sorted,
    sortKey: sortState.key,
    sortDir: sortState.dir,
    onSort,
  };
}
