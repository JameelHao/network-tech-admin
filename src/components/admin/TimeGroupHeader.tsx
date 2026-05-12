import type { TimeGroup } from "@/lib/admin/format";

type Props = {
  group: TimeGroup;
  count: number;
  labels: Record<TimeGroup, string>;
};

export function TimeGroupHeader({ group, count, labels }: Props) {
  return (
    <div className="flex items-center gap-3 px-5 py-2 bg-paper/40 border-b border-line">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
        {labels[group]}
      </span>
      <span className="font-mono text-[10px] tabular-nums text-ink-400">
        ({count})
      </span>
      <div className="flex-1 border-t border-line" />
    </div>
  );
}
