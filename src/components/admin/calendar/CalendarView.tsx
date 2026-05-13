"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tabClass, tabGroupClass } from "@/lib/admin/ui";
import type { Conference } from "@/lib/admin/types";
import type { Dict, Lang } from "@/lib/i18n/dict";
import { navigateMonth, formatMonthKey } from "@/lib/admin/calendar-utils";
import { MonthGrid, MobileCalendarList } from "./MonthGrid";
import { YearGrid } from "./YearGrid";

const MONTH_LABELS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_LABELS_ZH = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

type Props = {
  conferences: Conference[];
  yearConferences: Conference[];
  year: number;
  month: number;
  lang: Lang;
  t: Dict;
};

export function CalendarView({ conferences, yearConferences, year, month, lang, t }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"month" | "year">("month");
  const monthLabels = lang === "zh" ? MONTH_LABELS_ZH : MONTH_LABELS_EN;

  function goToMonth(y: number, m: number) {
    const key = formatMonthKey(y, m);
    router.push(`/admin/conferences?view=calendar&month=${key}`);
  }

  function handlePrev() {
    const { year: y, month: m } = navigateMonth(year, month, -1);
    goToMonth(y, m);
  }

  function handleNext() {
    const { year: y, month: m } = navigateMonth(year, month, 1);
    goToMonth(y, m);
  }

  function handleToday() {
    const now = new Date();
    goToMonth(now.getFullYear(), now.getMonth() + 1);
  }

  function handlePrevYear() {
    goToMonth(year - 1, month);
  }

  function handleNextYear() {
    goToMonth(year + 1, month);
  }

  return (
    <div className="rounded-lg border border-line bg-surface overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-line bg-paper/30">
        <div className="flex items-center gap-2">
          {mode === "month" ? (
            <>
              <NavButton onClick={handlePrev} label="‹" />
              <span className="font-sans text-[15px] font-semibold tracking-tight min-w-[140px] text-center">
                {monthLabels[month - 1]} {year}
              </span>
              <NavButton onClick={handleNext} label="›" />
            </>
          ) : (
            <>
              <NavButton onClick={handlePrevYear} label="‹" />
              <span className="font-sans text-[15px] font-semibold tracking-tight min-w-[60px] text-center">
                {year}
              </span>
              <NavButton onClick={handleNextYear} label="›" />
            </>
          )}
          <button
            onClick={handleToday}
            className="ml-2 rounded-md border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 hover:text-ink-800 hover:bg-paper/40 transition-colors"
          >
            {t.conf.today}
          </button>
        </div>
        <div className={tabGroupClass()}>
          <button
            onClick={() => setMode("month")}
            className={tabClass(mode === "month", "sm")}
          >
            {t.conf.monthView}
          </button>
          <button
            onClick={() => setMode("year")}
            className={tabClass(mode === "year", "sm")}
          >
            {t.conf.yearView}
          </button>
        </div>
      </header>

      <div className="p-4">
        {mode === "month" ? (
          <>
            <div className="hidden lg:block">
              <MonthGrid conferences={conferences} year={year} month={month} lang={lang} />
            </div>
            <div className="lg:hidden">
              <MobileCalendarList conferences={conferences} lang={lang} />
            </div>
          </>
        ) : (
          <YearGrid
            conferences={yearConferences}
            year={year}
            lang={lang}
            onMonthClick={(m) => {
              setMode("month");
              goToMonth(year, m);
            }}
          />
        )}
      </div>
    </div>
  );
}

function NavButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded-md border border-line text-ink-500 hover:text-ink-800 hover:bg-paper/40 transition-colors text-lg leading-none"
    >
      {label}
    </button>
  );
}
