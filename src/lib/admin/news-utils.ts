import type { NewsItem } from "./news";

export type NewsStats = {
  today: number;
  thisWeek: number;
};

export function computeNewsStats(items: NewsItem[], now = Date.now()): NewsStats {
  const todayStr = new Date(now).toISOString().slice(0, 10);
  const weekAgo = new Date(now - 7 * 86_400_000).toISOString().slice(0, 10);
  return {
    today: items.filter((n) => n.pub_date && n.pub_date.slice(0, 10) >= todayStr).length,
    thisWeek: items.filter((n) => n.pub_date && n.pub_date.slice(0, 10) >= weekAgo).length,
  };
}
