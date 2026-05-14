import type { Paper } from "./types";

export type SimilarPaper = Paper & { similarity: number };

export type TopicCluster = {
  topic: string;
  papers: Paper[];
  count: number;
  dateRange: string;
};

export function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function findSimilarPapers(
  paper: Paper,
  allPapers: Paper[],
  limit = 5,
): SimilarPaper[] {
  return allPapers
    .filter((p) => p.id !== paper.id)
    .map((p) => ({
      ...p,
      similarity: jaccardSimilarity(paper.topics, p.topics),
    }))
    .filter((p) => p.similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

export function clusterByTopics(papers: Paper[]): TopicCluster[] {
  const singleTopicMap = new Map<string, Paper[]>();
  const crossPapers: Paper[] = [];

  for (const p of papers) {
    if (p.topics.length <= 1) {
      const t = p.topics[0] ?? "uncategorized";
      if (!singleTopicMap.has(t)) singleTopicMap.set(t, []);
      singleTopicMap.get(t)!.push(p);
    } else {
      crossPapers.push(p);
    }
  }

  const crossKey = (topics: string[]) => [...topics].sort().join(" + ");
  const crossMap = new Map<string, Paper[]>();
  for (const p of crossPapers) {
    const key = crossKey(p.topics);
    if (!crossMap.has(key)) crossMap.set(key, []);
    crossMap.get(key)!.push(p);
  }

  const clusters: TopicCluster[] = [];

  for (const [topic, pList] of singleTopicMap) {
    clusters.push(buildCluster(topic, pList));
  }

  for (const [key, pList] of crossMap) {
    if (pList.length >= 2) {
      clusters.push(buildCluster(key, pList));
    } else {
      for (const p of pList) {
        const mainTopic = p.topics[0];
        if (!singleTopicMap.has(mainTopic)) {
          singleTopicMap.set(mainTopic, []);
          clusters.push(buildCluster(mainTopic, []));
        }
        const existing = clusters.find((c) => c.topic === mainTopic);
        if (existing) {
          existing.papers.push(p);
          existing.count = existing.papers.length;
          existing.dateRange = computeDateRange(existing.papers);
        }
      }
    }
  }

  return clusters.sort((a, b) => b.count - a.count);
}

function buildCluster(topic: string, papers: Paper[]): TopicCluster {
  return {
    topic,
    papers,
    count: papers.length,
    dateRange: computeDateRange(papers),
  };
}

export type PaperStats = {
  total: number;
  thisWeek: number;
  arxivCount: number;
  venueCount: number;
};

export function computePaperStats(papers: Paper[], now = Date.now(), totalOverride?: number): PaperStats {
  const weekAgo = new Date(now - 7 * 86_400_000).toISOString().slice(0, 10);
  return {
    total: totalOverride ?? papers.length,
    thisWeek: papers.filter((p) => p.published_date && p.published_date >= weekAgo).length,
    arxivCount: papers.filter((p) => p.source === "arxiv").length,
    venueCount: papers.filter((p) => p.source === "semantic-scholar").length,
  };
}

function computeDateRange(papers: Paper[]): string {
  const dates = papers
    .map((p) => p.published_date)
    .filter((d): d is string => d !== null)
    .sort();
  if (dates.length === 0) return "—";
  if (dates.length === 1) return dates[0].slice(0, 7);
  return `${dates[0].slice(0, 7)} ~ ${dates[dates.length - 1].slice(0, 7)}`;
}
