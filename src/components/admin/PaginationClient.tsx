"use client";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  labels: { rows: string; page: string };
};

export function PaginationClient({ page, totalPages, total, pageSize, onPageChange, labels }: Props) {
  if (totalPages <= 1 && total <= pageSize) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-line bg-paper/30 font-mono text-[11px] text-ink-500">
      <span className="tabular-nums">{total} {labels.rows}</span>
      <div className="flex items-center gap-1">
        {page > 1 && (
          <button onClick={() => onPageChange(page - 1)} className="px-2 py-1 rounded hover:bg-ink-100 transition-colors">←</button>
        )}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-2 py-1 rounded transition-colors ${
                p === page ? "bg-navy-700 text-navy-50" : "hover:bg-ink-100"
              }`}
            >
              {p}
            </button>
          ),
        )}
        {page < totalPages && (
          <button onClick={() => onPageChange(page + 1)} className="px-2 py-1 rounded hover:bg-ink-100 transition-colors">→</button>
        )}
      </div>
      <span>{pageSize} / {labels.page}</span>
    </div>
  );
}
