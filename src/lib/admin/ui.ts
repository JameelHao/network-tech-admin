export function tabClass(active: boolean, size: "sm" | "md" = "md"): string {
  const base = "rounded-full font-medium transition-all duration-[160ms] ease cursor-pointer";
  const sizing = size === "sm"
    ? "px-4 py-2 text-[12px] min-h-[36px]"
    : "px-[18px] py-2.5 text-[13px] min-h-[40px]";

  return active
    ? `${base} ${sizing} inline-flex items-center justify-center font-semibold tracking-[-0.01em] text-[#0059b2] bg-gradient-to-b from-white/[0.99] to-[rgba(247,250,255,0.98)] shadow-[inset_0_0_0_1px_rgba(0,113,227,0.16)] dark:text-[rgba(247,249,252,0.96)] dark:from-white/[0.085] dark:to-white/[0.03] dark:border dark:border-white/[0.11]`
    : `${base} ${sizing} inline-flex items-center justify-center tracking-[-0.01em] text-[#4f545a] bg-transparent hover:text-[#2f3944] hover:bg-white/[0.72] hover:-translate-y-px dark:text-[rgba(243,246,250,0.7)] dark:hover:bg-white/[0.06]`;
}

export function tabGroupClass(extra?: string): string {
  return `inline-flex items-center rounded-full border border-[rgba(17,24,39,0.08)] p-[5px] gap-1.5 bg-gradient-to-b from-[rgba(248,250,253,0.98)] to-white/[0.96] shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_2px_6px_rgba(17,24,39,0.04)]${extra ? ` ${extra}` : ""}`;
}

export function pageClass(active: boolean): string {
  return active
    ? "rounded-full bg-[rgba(238,247,255,0.98)] text-[#10293a] border border-[rgba(13,107,170,0.28)] shadow-[0_4px_12px_rgba(13,107,170,0.06)] dark:bg-[rgba(30,58,80,0.9)] dark:text-[#e2edf5] dark:border-[rgba(56,140,200,0.3)]"
    : "rounded-full text-[#1c4056] border border-transparent hover:bg-[rgba(244,249,255,0.98)] hover:border-[rgba(18,44,64,0.10)] dark:text-[#8ba8c0] dark:hover:bg-[rgba(20,40,58,0.5)]";
}

export function badgeClass(): string {
  return "rounded-full bg-[rgba(238,247,255,0.98)] text-[#10293a] border border-[rgba(13,107,170,0.18)] px-1.5 py-0.5 font-mono text-[9px] dark:bg-[rgba(30,58,80,0.9)] dark:text-[#e2edf5] dark:border-[rgba(56,140,200,0.25)]";
}

export function calendarTodayClass(): string {
  return "bg-gradient-to-br from-[#6366f1] to-[#818cf8] text-white font-semibold rounded-full shadow-[0_4px_12px_rgba(99,102,241,0.25)] dark:from-[#818cf8] dark:to-[#6366f1] dark:shadow-[0_4px_12px_rgba(99,102,241,0.3)]";
}
