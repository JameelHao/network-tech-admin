import type { Lang } from "@/lib/i18n/dict";

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

export function relativeTime(dateStr: string, lang: Lang = "en", now = Date.now()): string {
  const diff = now - new Date(dateStr).getTime();
  if (diff < 0) return lang === "zh" ? "刚刚" : "just now";

  if (diff < MINUTE) return lang === "zh" ? "刚刚" : "just now";
  if (diff < HOUR) {
    const m = Math.floor(diff / MINUTE);
    return lang === "zh" ? `${m}分钟前` : `${m}m ago`;
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    return lang === "zh" ? `${h}小时前` : `${h}h ago`;
  }
  if (diff < DAY * 30) {
    const d = Math.floor(diff / DAY);
    return lang === "zh" ? `${d}天前` : `${d}d ago`;
  }
  if (diff < DAY * 365) {
    const mo = Math.floor(diff / (DAY * 30));
    return lang === "zh" ? `${mo}个月前` : `${mo}mo ago`;
  }
  const y = Math.floor(diff / (DAY * 365));
  return lang === "zh" ? `${y}年前` : `${y}y ago`;
}

export type ConfStatus = { label: string; variant: "upcoming" | "ongoing" | "past" };

export function conferenceStatus(startDate: string, endDate: string | null, lang: Lang = "en"): ConfStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = endDate ? new Date(endDate) : start;
  end.setHours(0, 0, 0, 0);

  if (today > end) {
    return { label: lang === "zh" ? "已结束" : "Past", variant: "past" };
  }
  if (today >= start && today <= end) {
    return { label: lang === "zh" ? "进行中" : "Ongoing", variant: "ongoing" };
  }
  const days = Math.ceil((start.getTime() - today.getTime()) / DAY);
  const lbl = lang === "zh" ? `${days}天后` : `in ${days}d`;
  return { label: lbl, variant: "upcoming" };
}

const MONTH_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDateRange(startDate: string, endDate: string | null): string {
  const s = new Date(startDate);
  if (!endDate) {
    return `${MONTH_EN[s.getUTCMonth()]} ${s.getUTCDate()}`;
  }
  const e = new Date(endDate);
  if (s.getUTCMonth() === e.getUTCMonth()) {
    return `${MONTH_EN[s.getUTCMonth()]} ${s.getUTCDate()}–${e.getUTCDate()}`;
  }
  return `${MONTH_EN[s.getUTCMonth()]} ${s.getUTCDate()} – ${MONTH_EN[e.getUTCMonth()]} ${e.getUTCDate()}`;
}

export function isExpired(dateStr: string | undefined | null, thresholdDays = 30, now = Date.now()): boolean {
  if (!dateStr) return false;
  return now - new Date(dateStr).getTime() > thresholdDays * DAY;
}

export type TimeGroup = "today" | "week" | "month" | "older";

export function getTimeGroup(dateStr: string | null | undefined): TimeGroup {
  if (!dateStr) return "older";
  const age = Date.now() - new Date(dateStr).getTime();
  if (age < DAY) return "today";
  if (age < 7 * DAY) return "week";
  if (age < 30 * DAY) return "month";
  return "older";
}

export function isNew(dateStr: string | null | undefined, now = Date.now()): boolean {
  if (!dateStr) return false;
  return now - new Date(dateStr).getTime() < DAY;
}

export function isCurrentYear(dateStr: string | null | undefined, now = Date.now()): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).getFullYear() === new Date(now).getFullYear();
}
