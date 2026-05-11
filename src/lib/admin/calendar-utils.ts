import type { Conference, TopicCategory } from "./types";

export type CalendarDay = {
  date: string;
  day: number;
  inMonth: boolean;
};

export type EventSegment = {
  conference: Conference;
  startCol: number;
  span: number;
  isStart: boolean;
  isEnd: boolean;
};

export function getMonthDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month - 1 < 1 ? 12 : month - 1;
    const y = month - 1 < 1 ? year - 1 : year;
    days.push({
      date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      day: d,
      inMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      day: d,
      inMonth: true,
    });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    const nextMonth = month + 1 > 12 ? 1 : month + 1;
    const nextYear = month + 1 > 12 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        day: d,
        inMonth: false,
      });
    }
  }

  return days;
}

export function getWeekRows(days: CalendarDay[]): CalendarDay[][] {
  const rows: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7));
  }
  return rows;
}

export function getEventSegmentsForWeek(
  conferences: Conference[],
  weekDates: string[],
): EventSegment[][] {
  const rows: EventSegment[][] = [];

  for (const conf of conferences) {
    const startDate = conf.start_date;
    const endDate = conf.end_date ?? conf.start_date;

    let firstIdx = -1;
    let lastIdx = -1;

    for (let i = 0; i < weekDates.length; i++) {
      if (weekDates[i] >= startDate && weekDates[i] <= endDate) {
        if (firstIdx === -1) firstIdx = i;
        lastIdx = i;
      }
    }

    if (firstIdx === -1) continue;

    const segment: EventSegment = {
      conference: conf,
      startCol: firstIdx,
      span: lastIdx - firstIdx + 1,
      isStart: weekDates[firstIdx] === startDate,
      isEnd: weekDates[lastIdx] === endDate,
    };

    let placed = false;
    for (const row of rows) {
      const overlaps = row.some(
        (s) =>
          s.startCol < segment.startCol + segment.span &&
          s.startCol + s.span > segment.startCol,
      );
      if (!overlaps) {
        row.push(segment);
        placed = true;
        break;
      }
    }
    if (!placed) {
      rows.push([segment]);
    }
  }

  return rows;
}

const CATEGORY_COLORS: Record<TopicCategory, { bg: string; text: string; border: string }> = {
  "network-systems": { bg: "bg-cobalt-100", text: "text-cobalt-700", border: "border-cobalt-500" },
  "measurement":     { bg: "bg-moss-100",   text: "text-moss-700",   border: "border-moss-500" },
  "security":        { bg: "bg-rust-100",   text: "text-rust-700",   border: "border-rust-500" },
  "emerging":        { bg: "bg-purple-100",  text: "text-purple-700", border: "border-purple-500" },
  "infrastructure":  { bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-500" },
};

export function getCategoryCalendarColor(category: TopicCategory) {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS["network-systems"];
}

export function getTierMarker(tier: string): string {
  switch (tier) {
    case "top": return "●";
    case "good": return "○";
    default: return "·";
  }
}

export function formatMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m };
}

export function navigateMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}
