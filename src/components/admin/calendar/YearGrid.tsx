"use client";

import type { Conference } from "@/lib/admin/types";
import { getCategoryCalendarColor } from "@/lib/admin/calendar-utils";

const MONTH_NAMES_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES_ZH = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

type Props = {
  conferences: Conference[];
  year: number;
  lang: "en" | "zh";
  onMonthClick: (month: number) => void;
};

export function YearGrid({ conferences, year, lang, onMonthClick }: Props) {
  const monthNames = lang === "zh" ? MONTH_NAMES_ZH : MONTH_NAMES_EN;
  const today = new Date();
  const currentMonth = today.getFullYear() === year ? today.getMonth() + 1 : -1;

  const monthData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const confs = conferences.filter((c) => {
      const end = c.end_date ?? c.start_date;
      return c.start_date <= monthEnd && end >= monthStart;
    });

    const daySet = new Set<number>();
    for (const c of confs) {
      const s = Math.max(1, c.start_date >= monthStart ? parseInt(c.start_date.slice(8), 10) : 1);
      const eStr = c.end_date ?? c.start_date;
      const e = Math.min(lastDay, eStr <= monthEnd ? parseInt(eStr.slice(8), 10) : lastDay);
      for (let d = s; d <= e; d++) daySet.add(d);
    }

    return { month, confs, daySet, lastDay };
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {monthData.map(({ month, confs, daySet, lastDay }) => {
        const firstDow = new Date(year, month - 1, 1).getDay();
        return (
          <button
            key={month}
            onClick={() => onMonthClick(month)}
            className={`rounded-lg border border-line p-3 text-left cursor-pointer hover:bg-paper/40 transition-colors ${
              month === currentMonth ? "ring-2 ring-navy-500/40" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-semibold text-ink-700">
                {monthNames[month - 1]}
              </span>
              {confs.length > 0 && (
                <span className="rounded-full bg-navy-700 text-navy-50 px-1.5 py-0.5 font-mono text-[9px]">
                  {confs.length}
                </span>
              )}
            </div>
            <div className="grid grid-cols-7 gap-px">
              {Array.from({ length: firstDow }, (_, i) => (
                <div key={`pad-${i}`} className="w-4 h-4" />
              ))}
              {Array.from({ length: lastDay }, (_, i) => {
                const d = i + 1;
                const hasEvent = daySet.has(d);
                const isToday = month === currentMonth && d === today.getDate();
                return (
                  <div
                    key={d}
                    className={`w-4 h-4 flex items-center justify-center rounded-full text-[8px] tabular-nums ${
                      isToday
                        ? "bg-navy-700 text-navy-50 font-bold"
                        : hasEvent
                          ? "bg-navy-500/20 text-navy-700 font-medium"
                          : "text-ink-300"
                    }`}
                  >
                    {hasEvent ? "•" : ""}
                  </div>
                );
              })}
            </div>
            {confs.length > 0 && (
              <div className="mt-2 space-y-0.5">
                {confs.slice(0, 3).map((c) => {
                  const colors = getCategoryCalendarColor(c.category);
                  return (
                    <div
                      key={c.id}
                      className={`${colors.bg} ${colors.text} rounded-sm px-1 py-0.5 text-[9px] font-medium truncate`}
                    >
                      {c.abbreviation ?? c.name}
                    </div>
                  );
                })}
                {confs.length > 3 && (
                  <div className="text-[9px] text-ink-400">+{confs.length - 3}</div>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
