import type { NewsItem } from "./news";

export type JobStats = {
  total: number;
  thisWeek: number;
  active: number;
  sourceCount: number;
};

export function computeJobStats(items: NewsItem[], now = Date.now()): JobStats {
  const weekAgo = new Date(now - 7 * 86_400_000).toISOString().slice(0, 10);
  const twoWeeksAgo = new Date(now - 14 * 86_400_000).toISOString().slice(0, 10);
  return {
    total: items.length,
    thisWeek: items.filter((j) => j.pub_date && j.pub_date.slice(0, 10) >= weekAgo).length,
    active: items.filter((j) => j.pub_date && j.pub_date.slice(0, 10) >= twoWeeksAgo).length,
    sourceCount: new Set(items.map((j) => j.source).filter(Boolean)).size,
  };
}
