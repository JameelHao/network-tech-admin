export function tabClass(active: boolean, size: "sm" | "md" = "md"): string {
  const base = "rounded-full font-medium transition-all duration-[140ms] ease";
  const sizing = size === "sm"
    ? "px-3 py-1 text-[11px]"
    : "px-4 py-[7px] text-[12px]";

  return active
    ? `${base} ${sizing} bg-[rgba(238,247,255,0.98)] text-[#10293a] border border-[rgba(13,107,170,0.28)] shadow-[0_8px_18px_rgba(13,107,170,0.08)] dark:bg-[rgba(30,58,80,0.9)] dark:text-[#e2edf5] dark:border-[rgba(56,140,200,0.3)] dark:shadow-[0_8px_18px_rgba(0,0,0,0.15)]`
    : `${base} ${sizing} text-[#1c4056] border border-[rgba(18,44,64,0.10)] bg-[rgba(248,251,255,0.96)] hover:bg-[rgba(244,249,255,0.98)] hover:shadow-[0_8px_18px_rgba(18,44,64,0.05)] dark:bg-[rgba(20,40,58,0.8)] dark:text-[#8ba8c0] dark:border-[rgba(40,70,95,0.2)]`;
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
