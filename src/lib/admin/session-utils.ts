import type { ConferenceSession } from "./types";

export type TopicGroup = { topic: string; sessions: ConferenceSession[] };

export function groupSessionsByTopic(sessions: ConferenceSession[]): TopicGroup[] {
  const map = new Map<string, ConferenceSession[]>();
  for (const s of sessions) {
    const topic = s.topics[0] ?? "other";
    if (!map.has(topic)) map.set(topic, []);
    map.get(topic)!.push(s);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([topic, items]) => ({ topic, sessions: items }));
}

export function getTopAuthors(
  sessions: ConferenceSession[],
  limit = 5,
): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    for (const a of s.authors) {
      counts.set(a, (counts.get(a) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function getTopAffiliations(
  sessions: ConferenceSession[],
  limit = 5,
): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    for (const a of s.affiliations) {
      counts.set(a, (counts.get(a) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function getTopicDistribution(
  sessions: ConferenceSession[],
): { topic: string; count: number; pct: number }[] {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    for (const t of s.topics) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, count, pct: Math.round((count / total) * 100) }));
}
