import Link from "next/link";
import { pageClass } from "@/lib/admin/ui";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  basePath: string;
  searchParams?: Record<string, string>;
  labels: { rows: string; page: string; of: string };
};

function buildHref(basePath: string, params: Record<string, string>, page: number, pageSize: number) {
  const sp = new URLSearchParams(params);
  if (page > 1) sp.set("page", String(page));
  if (pageSize !== 50) sp.set("size", String(pageSize));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ page, totalPages, total, pageSize, basePath, searchParams = {}, labels }: Props) {
  if (totalPages <= 1 && total <= pageSize) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const sizes = [25, 50, 100];

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-line bg-paper/30 font-mono text-[11px] text-ink-500">
      <span className="tabular-nums">
        {total} {labels.rows}
      </span>
      <div className="flex items-center gap-1">
        {page > 1 && (
          <Link
            href={buildHref(basePath, searchParams, page - 1, pageSize)}
            className="px-2 py-1 rounded hover:bg-ink-100 transition-colors"
          >
            ←
          </Link>
        )}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-1">…</span>
          ) : (
            <Link
              key={p}
              href={buildHref(basePath, searchParams, p, pageSize)}
              className={`px-2 py-1 transition-colors ${pageClass(p === page)}`}
            >
              {p}
            </Link>
          ),
        )}
        {page < totalPages && (
          <Link
            href={buildHref(basePath, searchParams, page + 1, pageSize)}
            className="px-2 py-1 rounded hover:bg-ink-100 transition-colors"
          >
            →
          </Link>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {sizes.map((s) => (
          <Link
            key={s}
            href={buildHref(basePath, searchParams, 1, s)}
            className={`px-1.5 py-0.5 transition-colors ${pageClass(s === pageSize)}`}
          >
            {s}
          </Link>
        ))}
        <span className="ml-0.5">/ {labels.page}</span>
      </div>
    </div>
  );
}
