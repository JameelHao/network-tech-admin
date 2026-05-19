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
    if (s.counts.papers > 0) activeCount++;
    if (!hottest || s.counts.papers > hottest.counts.papers) hottest = s;
  }
  return {
    totalTopics: activeCount,
    categoryCount: Object.keys(TOPIC_CATEGORIES).length,
    activeCount,
    hottestTopic: hottest && hottest.counts.papers > 0 ? hottest.slug : "—",
  };
}
