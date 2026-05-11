function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-ink-100 ${className ?? ""}`} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-3.5">
          {Array.from({ length: cols }, (_, c) => (
            <Pulse key={c} className={`h-3 ${c === 0 ? "w-2/5" : "w-1/6"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-line bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
        <Pulse className="h-4 w-32" />
        <Pulse className="h-3 w-16" />
      </div>
      <TableSkeleton rows={4} cols={3} />
    </div>
  );
}

export function StatSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-px bg-line rounded-lg overflow-hidden border border-line`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-surface p-6 space-y-3">
          <Pulse className="h-3 w-20" />
          <Pulse className="h-7 w-14" />
          <Pulse className="h-2.5 w-24" />
        </div>
      ))}
    </div>
  );
}
