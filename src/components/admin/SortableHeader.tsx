import Link from "next/link";
import type { SortDir } from "@/lib/admin/pagination";

type Props = {
  column: string;
  label: string;
  currentSort?: string;
  currentDir?: SortDir;
  basePath: string;
  searchParams?: Record<string, string>;
  className?: string;
};

function nextDir(column: string, currentSort?: string, currentDir?: SortDir): SortDir | null {
  if (currentSort !== column) return "asc";
  if (currentDir === "asc") return "desc";
  return null;
}

function Arrow({ dir }: { dir?: SortDir }) {
  if (!dir) return null;
  return (
    <span className="ml-0.5 text-navy-500">{dir === "asc" ? "↑" : "↓"}</span>
  );
}

function ariaSortValue(column: string, currentSort?: string, currentDir?: SortDir): "ascending" | "descending" | "none" {
  if (currentSort !== column) return "none";
  return currentDir === "asc" ? "ascending" : "descending";
}

export function SortableHeader({ column, label, currentSort, currentDir, basePath, searchParams = {}, className }: Props) {
  const isActive = currentSort === column;
  const nd = nextDir(column, currentSort, currentDir);

  const params = new URLSearchParams(searchParams);
  params.delete("page");
  if (nd) {
    params.set("sort", column);
    params.set("dir", nd);
  } else {
    params.delete("sort");
    params.delete("dir");
  }
  const qs = params.toString();
  const href = qs ? `${basePath}?${qs}` : basePath;

  return (
    <th aria-sort={ariaSortValue(column, currentSort, currentDir)} className={`px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 text-left ${className ?? ""}`}>
      <Link href={href} className="inline-flex items-center gap-0.5 hover:text-ink-800 transition-colors">
        {label}
        {isActive && <Arrow dir={currentDir} />}
      </Link>
    </th>
  );
}

export function SortableHeaderClient({
  column,
  label,
  currentSort,
  currentDir,
  onSort,
}: {
  column: string;
  label: string;
  currentSort?: string;
  currentDir?: SortDir;
  onSort: (col: string, dir: SortDir | null) => void;
}) {
  const isActive = currentSort === column;
  const nd = nextDir(column, currentSort, currentDir);

  return (
    <button
      type="button"
      onClick={() => onSort(column, nd)}
      aria-pressed={isActive}
      className="inline-flex items-center gap-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 hover:text-ink-800 transition-colors"
    >
      {label}
      {isActive && <Arrow dir={currentDir} />}
    </button>
  );
}
