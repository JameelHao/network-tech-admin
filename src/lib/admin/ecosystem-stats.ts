import { quarterKey } from "./insights";
import { TOPICS, type TopicCategory } from "./topics";
import type { Paper, Conference, Product, OpenSource, Vendor } from "./types";

export type TopicMatrixRow = {
  slug: string;
  category: TopicCategory;
  papers: number;
  conferences: number;
  products: number;
  opensource: number;
  vendors: number;
  total: number;
};

export function aggregateTopicMatrix(
  papers: Pick<Paper, "topics">[],
  conferences: Pick<Conference, "topics">[],
  products: Pick<Product, "topics">[],
  opensource: Pick<OpenSource, "topics">[],
  vendors: Pick<Vendor, "topics">[],
): TopicMatrixRow[] {
  const counts = new Map<string, Omit<TopicMatrixRow, "slug" | "category" | "total">>();
  for (const t of TOPICS) {
    counts.set(t.slug, { papers: 0, conferences: 0, products: 0, opensource: 0, vendors: 0 });
  }

  const inc = (slug: string, dim: keyof Omit<TopicMatrixRow, "slug" | "category" | "total">) => {
    const row = counts.get(slug);
    if (row) row[dim]++;
  };

  for (const p of papers) for (const t of p.topics) inc(t, "papers");
  for (const c of conferences) for (const t of c.topics) inc(t, "conferences");
  for (const p of products) for (const t of p.topics) inc(t, "products");
  for (const o of opensource) for (const t of o.topics) inc(t, "opensource");
  for (const v of vendors) for (const t of v.topics) inc(t, "vendors");

  return TOPICS.map((t) => {
    const c = counts.get(t.slug)!;
    return {
      slug: t.slug,
      category: t.category,
      ...c,
      total: c.papers + c.conferences + c.products + c.opensource + c.vendors,
    };
  }).filter((r) => r.total > 0);
}

export type VendorTopicCell = {
  vendorName: string;
  vendorId: string;
  topics: string[];
  productTopics: Record<string, string[]>;
};

export function buildVendorTopicMap(
  vendors: Pick<Vendor, "id" | "name" | "topics" | "key_products" | "stage">[],
  products: Pick<Product, "name" | "topics">[],
): VendorTopicCell[] {
  const productMap = new Map<string, string[]>();
  for (const p of products) {
    productMap.set(p.name, p.topics);
  }

  return vendors
    .filter((v) => v.stage !== "archived")
    .map((v) => {
      const allTopics = new Set(v.topics);
      const productTopics: Record<string, string[]> = {};
      for (const pName of v.key_products) {
        const pTopics = productMap.get(pName);
        if (pTopics) {
          productTopics[pName] = pTopics;
          for (const t of pTopics) allTopics.add(t);
        }
      }
      return {
        vendorName: v.name,
        vendorId: v.id,
        topics: Array.from(allTopics).sort(),
        productTopics,
      };
    })
    .filter((v) => v.topics.length > 0);
}

export type TrendPoint = {
  quarter: string;
  [topicSlug: string]: string | number;
};

export function getTopicQuarterlyTrend(
  papers: Pick<Paper, "topics" | "published_date">[],
  topN = 5,
): TrendPoint[] {
  const topicCounts = new Map<string, number>();
  for (const p of papers) {
    if (!p.published_date) continue;
    for (const t of p.topics) {
      topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1);
    }
  }

  const topTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([slug]) => slug);

  const quarterMap = new Map<string, Record<string, number>>();
  for (const p of papers) {
    if (!p.published_date) continue;
    const q = quarterKey(p.published_date);
    if (!quarterMap.has(q)) {
      quarterMap.set(q, Object.fromEntries(topTopics.map((t) => [t, 0])));
    }
    const rec = quarterMap.get(q)!;
    for (const t of p.topics) {
      if (t in rec) rec[t]++;
    }
  }

  return Array.from(quarterMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([quarter, counts]) => ({ quarter, ...counts }));
}

export type BubblePoint = {
  name: string;
  stars: number;
  category: TopicCategory | "other";
  lastActive: string;
  repoUrl: string;
};

export function buildOpenSourceBubbles(
  opensource: Pick<OpenSource, "name" | "stars" | "topics" | "last_active" | "repo_url">[],
): BubblePoint[] {
  return opensource.map((o) => {
    const firstTopic = o.topics[0];
    const def = TOPICS.find((t) => t.slug === firstTopic);
    return {
      name: o.name,
      stars: o.stars,
      category: def?.category ?? "other",
      lastActive: o.last_active,
      repoUrl: o.repo_url,
    };
  });
}
