import type { OpenSource } from "./types";

export type OpenSourceStats = {
  total: number;
  active: number;
  highStars: number;
  languageCount: number;
};

export function computeOpenSourceStats(projects: OpenSource[], now = Date.now()): OpenSourceStats {
  const ninetyDaysAgo = new Date(now - 90 * 86_400_000).toISOString().slice(0, 10);
  return {
    total: projects.length,
    active: projects.filter((p) => p.last_active && p.last_active >= ninetyDaysAgo).length,
    highStars: projects.filter((p) => p.stars != null && p.stars >= 5000).length,
    languageCount: new Set(projects.map((p) => p.language).filter(Boolean)).size,
  };
}
