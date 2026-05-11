"use client";

import { useRouter } from "next/navigation";
import type { Conference } from "@/lib/admin/types";
import {
  getMonthDays,
  getWeekRows,
  getEventSegmentsForWeek,
  getCategoryCalendarColor,
  getTierMarker,
  type EventSegment,
} from "@/lib/admin/calendar-utils";

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_ZH = ["日", "一", "二", "三", "四", "五", "六"];

const MAX_VISIBLE_ROWS = 3;

type Props = {
  conferences: Conference[];
  year: number;
  month: number;
  lang: "en" | "zh";
};

export function MonthGrid({ conferences, year, month, lang }: Props) {
  const router = useRouter();
  const days = getMonthDays(year, month);
  const weeks = getWeekRows(days);
  const today = new Date().toISOString().slice(0, 10);
  const weekdays = lang === "zh" ? WEEKDAYS_ZH : WEEKDAYS_EN;

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-line">
        {weekdays.map((wd) => (
          <div
            key={wd}
            className="px-2 py-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500"
          >
            {wd}
          </div>
        ))}
      </div>

      {weeks.map((week, wi) => {
        const weekDates = week.map((d) => d.date);
        const segmentRows = getEventSegmentsForWeek(conferences, weekDates);

        return (
          <div key={wi} className="grid grid-cols-7 border-b border-line last:border-b-0">
            {week.map((day) => (
              <div
                key={day.date}
                className={`min-h-[100px] border-r border-line last:border-r-0 px-1.5 pt-1 pb-0.5 ${
                  !day.inMonth ? "bg-paper/30" : ""
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 text-xs tabular-nums rounded-full ${
                    day.date === today
                      ? "bg-navy-700 text-navy-50 font-semibold"
                      : day.inMonth
                        ? "text-ink-700"
                        : "text-ink-300"
                  }`}
                >
                  {day.day}
                </span>
              </div>
            ))}

            <div className="col-span-7 relative" style={{ minHeight: Math.min(segmentRows.length, MAX_VISIBLE_ROWS) * 24 + (segmentRows.length > MAX_VISIBLE_ROWS ? 16 : 0) }}>
              {segmentRows.slice(0, MAX_VISIBLE_ROWS).map((row, ri) =>
                row.map((seg) => (
                  <EventBar
                    key={`${seg.conference.id}-${wi}-${ri}`}
                    segment={seg}
                    row={ri}
                    onClick={() => router.push(`/admin/conferences/${seg.conference.id}`)}
                  />
                )),
              )}
              {segmentRows.length > MAX_VISIBLE_ROWS && (
                <div className="absolute bottom-0 left-0 px-2 text-[10px] text-ink-500">
                  +{segmentRows.length - MAX_VISIBLE_ROWS} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventBar({
  segment,
  row,
  onClick,
}: {
  segment: EventSegment;
  row: number;
  onClick: () => void;
}) {
  const colors = getCategoryCalendarColor(segment.conference.category);
  const tier = getTierMarker(segment.conference.tier);
  const label = segment.conference.abbreviation ?? segment.conference.name;

  const leftPct = (segment.startCol / 7) * 100;
  const widthPct = (segment.span / 7) * 100;

  return (
    <button
      onClick={onClick}
      className={`absolute h-[20px] ${colors.bg} ${colors.text} border-l-2 ${colors.border} rounded-sm px-1.5 text-[10px] font-medium truncate cursor-pointer hover:opacity-80 transition-opacity text-left`}
      style={{
        top: row * 24,
        left: `${leftPct}%`,
        width: `${widthPct}%`,
      }}
      title={`${segment.conference.name} (${segment.conference.start_date}${segment.conference.end_date ? ` → ${segment.conference.end_date}` : ""})`}
    >
      {tier} {label}
    </button>
  );
}

export function MobileCalendarList({
  conferences,
  lang,
}: {
  conferences: Conference[];
  lang: "en" | "zh";
}) {
  const router = useRouter();

  const grouped = new Map<string, Conference[]>();
  for (const c of conferences) {
    const key = c.start_date;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(c);
  }

  const sortedDates = Array.from(grouped.keys()).sort();

  if (!sortedDates.length) {
    return <p className="text-ink-400 text-sm py-8 text-center">No conferences this month</p>;
  }

  return (
    <div className="divide-y divide-line">
      {sortedDates.map((date) => (
        <div key={date} className="py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mb-2">
            {date}
          </p>
          <div className="space-y-1.5">
            {grouped.get(date)!.map((c) => {
              const colors = getCategoryCalendarColor(c.category);
              const tier = getTierMarker(c.tier);
              return (
                <button
                  key={c.id}
                  onClick={() => router.push(`/admin/conferences/${c.id}`)}
                  className={`w-full text-left ${colors.bg} ${colors.text} border-l-2 ${colors.border} rounded-sm px-3 py-2 text-[12px] font-medium cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  {tier} {c.abbreviation ?? c.name}
                  {c.end_date && c.end_date !== c.start_date && (
                    <span className="text-[10px] opacity-70 ml-2">→ {c.end_date}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
