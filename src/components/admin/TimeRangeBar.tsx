"use client";

type Props = {
  value: string;
  onChange: (range: string) => void;
  labels: { today: string; week: string; month: string; all: string };
};

const RANGES = ["today", "week", "month", ""] as const;

export function TimeRangeBar({ value, onChange, labels }: Props) {
  const labelMap: Record<string, string> = {
    today: labels.today,
    week: labels.week,
    month: labels.month,
    "": labels.all,
  };

  return (
    <div className="inline-flex items-center rounded-md border border-line bg-surface p-0.5" role="group" aria-label="Time range">
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-[0.12em] transition-colors ${
            value === r
              ? "bg-navy-700 text-navy-50"
              : "text-ink-500 hover:text-ink-800"
          }`}
        >
          {labelMap[r]}
        </button>
      ))}
    </div>
  );
}
