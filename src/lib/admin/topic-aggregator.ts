import { TOPICS, TOPIC_MAP, type TopicCategory, type TopicDef } from "./topics";
import type { Paper, Conference, OpenSource, TalentLead } from "./types";

type EntityCounts = {
  papers: number;
  conferences: number;
  talents: number;
  opensource: number;
};

type EntityItems = {
  papers: { id: string; title: string }[];
  conferences: { id: string; name: string }[];
  talents: { id: string; name: string }[];
  opensource: { id: string; name: string }[];
};

export type TopicStat = {
  slug: string;
  category: TopicCategory | "other";
  en?: string;
  zh?: string;
  counts: EntityCounts;
  total: number;
  items: EntityItems;
  duplicateGroup?: string;
};

function normalize(slug: string): string {
  return slug.toLowerCase().replace(/[-_.\s]/g, "");
}

export function aggregateTopics(
  papers: Pick<Paper, "id" | "title" | "topics">[],
  conferences: Pick<Conference, "id" | "name" | "topics">[],
  talents: Pick<TalentLead, "id" | "name" | "topics">[],
  opensource: Pick<OpenSource, "id" | "name" | "topics">[],
  options: { definitions?: TopicDef[]; includeDefinitions?: boolean } = {},
): TopicStat[] {
  const map = new Map<string, TopicStat>();
  const definitions = options.definitions ?? TOPICS;
  const topicMap = Object.fromEntries(definitions.map((t) => [t.slug, t])) as Record<string, TopicDef | undefined>;

  function ensure(slug: string): TopicStat {
    let stat = map.get(slug);
    if (!stat) {
      const def = topicMap[slug] ?? TOPIC_MAP[slug];
      stat = {
        slug,
        category: def?.category ?? "other",
        en: def?.en,
        zh: def?.zh,
        counts: { papers: 0, conferences: 0, talents: 0, opensource: 0 },
        total: 0,
        items: { papers: [], conferences: [], talents: [], opensource: [] },
      };
      map.set(slug, stat);
    }
    return stat;
  }

  if (options.includeDefinitions) {
    for (const topic of definitions) ensure(topic.slug);
  }

  for (const p of papers) {
    for (const t of p.topics) {
      const s = ensure(t);
      s.counts.papers++;
      s.total++;
      s.items.papers.push({ id: p.id, title: p.title });
    }
  }

  for (const c of conferences) {
    for (const t of c.topics) {
      const s = ensure(t);
      s.counts.conferences++;
      s.total++;
      s.items.conferences.push({ id: c.id, name: c.name });
    }
  }

  for (const tl of talents) {
    for (const t of tl.topics) {
      const s = ensure(t);
      s.counts.talents++;
      s.total++;
      s.items.talents.push({ id: tl.id, name: tl.name });
    }
  }

  for (const o of opensource) {
    for (const t of o.topics) {
      const s = ensure(t);
      s.counts.opensource++;
      s.total++;
      s.items.opensource.push({ id: o.id, name: o.name });
    }
  }

  return Array.from(map.values());
}

export function detectDuplicates(stats: TopicStat[]): TopicStat[] {
  const groups = new Map<string, string[]>();
  for (const s of stats) {
    const key = normalize(s.slug);
    const arr = groups.get(key) ?? [];
    arr.push(s.slug);
    groups.set(key, arr);
  }

  return stats.map((s) => {
    const key = normalize(s.slug);
    const group = groups.get(key);
    return {
      ...s,
      duplicateGroup: group && group.length > 1 ? key : undefined,
    };
  });
}
