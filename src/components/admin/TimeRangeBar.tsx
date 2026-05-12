"use client";

import { tabClass } from "@/lib/admin/ui";

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
    <div className="inline-flex items-center gap-1" role="group" aria-label="Time range">
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={tabClass(value === r, "sm")}
        >
          {labelMap[r]}
        </button>
      ))}
    </div>
  );
}
