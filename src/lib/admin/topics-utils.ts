import type { TopicStat } from "./topic-aggregator";
import { TOPIC_CATEGORIES } from "./topics";

export type TopicPageStats = {
  totalTopics: number;
  categoryCount: number;
  activeCount: number;
  hottestTopic: string;
};

export function computeTopicPageStats(stats: TopicStat[]): TopicPageStats {
  let hottest: TopicStat | null = null;
  let activeCount = 0;
  for (const s of stats) {
    if (s.total > 0) activeCount++;
    if (!hottest || s.total > hottest.total) hottest = s;
  }
  return {
    totalTopics: stats.length,
    categoryCount: Object.keys(TOPIC_CATEGORIES).length,
    activeCount,
    hottestTopic: hottest && hottest.total > 0 ? hottest.slug : "—",
  };
}
