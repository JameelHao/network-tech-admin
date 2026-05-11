import { StatSkeleton, TableSkeleton } from "@/components/admin/Skeleton";

export default function Loading() {
  return (
    <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10 space-y-6">
      <StatSkeleton count={4} />
      <div className="rounded-lg border border-line bg-surface overflow-hidden">
        <TableSkeleton rows={8} cols={5} />
      </div>
    </main>
  );
}
