import type { Lang } from "@/lib/i18n/dict";

export type FreshnessLevel = "fresh" | "recent" | "stale" | "expired";

type FreshnessResult = {
  level: FreshnessLevel;
  color: string;
  dotClass: string;
};

const HOUR = 3_600_000;

export function getFreshness(lastSync: string | null): FreshnessResult {
  if (!lastSync) {
    return { level: "expired", color: "text-red-600", dotClass: "bg-red-500" };
  }
  const age = Date.now() - new Date(lastSync).getTime();
  if (age < HOUR) {
    return { level: "fresh", color: "text-emerald-600", dotClass: "bg-emerald-500" };
  }
  if (age < 6 * HOUR) {
    return { level: "recent", color: "text-yellow-600", dotClass: "bg-yellow-500" };
  }
  if (age < 24 * HOUR) {
    return { level: "stale", color: "text-orange-600", dotClass: "bg-orange-500" };
  }
  return { level: "expired", color: "text-red-600", dotClass: "bg-red-500" };
}

const LABELS: Record<FreshnessLevel, { en: string; zh: string }> = {
  fresh: { en: "Just synced", zh: "刚刚同步" },
  recent: { en: "Data is recent", zh: "数据较新" },
  stale: { en: "Suggest refresh", zh: "建议刷新" },
  expired: { en: "May be stale", zh: "数据可能过期" },
};

export function freshnessLabel(level: FreshnessLevel, lang: Lang): string {
  return LABELS[level][lang];
}
