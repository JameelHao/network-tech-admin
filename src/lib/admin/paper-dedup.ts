import type { Paper } from "./types";

export type DuplicateGroup = {
  key: string;
  papers: { id: string; title: string; authors: string[]; url: string | null }[];
  similarity: number;
  reason: "exact-title" | "similar-title" | "same-authors-similar-title";
};

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function jaccardSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(" ").filter(Boolean));
  const wordsB = new Set(b.split(" ").filter(Boolean));
  if (wordsA.size === 0 && wordsB.size === 0) return 1;
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  const union = wordsA.size + wordsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function authorOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a.map((n) => n.toLowerCase()));
  const setB = new Set(b.map((n) => n.toLowerCase()));
  let overlap = 0;
  for (const n of setA) {
    if (setB.has(n)) overlap++;
  }
  return overlap / Math.min(setA.size, setB.size);
}

function groupKey(ids: string[]): string {
  return [...ids].sort().join(":");
}

export function findDuplicateGroups(
  papers: Pick<Paper, "id" | "title" | "authors" | "url">[],
): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const matched = new Set<string>();

  const normalizedMap = new Map<string, typeof papers>();
  for (const p of papers) {
    const norm = normalizeTitle(p.title);
    const arr = normalizedMap.get(norm) ?? [];
    arr.push(p);
    normalizedMap.set(norm, arr);
  }

  for (const [, paperGroup] of normalizedMap) {
    if (paperGroup.length > 1) {
      for (const p of paperGroup) matched.add(p.id);
      groups.push({
        key: groupKey(paperGroup.map((p) => p.id)),
        papers: paperGroup.map((p) => ({
          id: p.id,
          title: p.title,
          authors: [...p.authors],
          url: p.url,
        })),
        similarity: 100,
        reason: "exact-title",
      });
    }
  }

  const unmatched = papers.filter((p) => !matched.has(p.id));
  const sorted = [...unmatched].sort((a, b) =>
    normalizeTitle(a.title).localeCompare(normalizeTitle(b.title)),
  );

  const WINDOW = 20;
  const THRESHOLD = 0.85;

  for (let i = 0; i < sorted.length; i++) {
    if (matched.has(sorted[i].id)) continue;
    const normI = normalizeTitle(sorted[i].title);

    for (let j = i + 1; j < Math.min(i + WINDOW, sorted.length); j++) {
      if (matched.has(sorted[j].id)) continue;
      const normJ = normalizeTitle(sorted[j].title);
      const sim = jaccardSimilarity(normI, normJ);

      if (sim >= THRESHOLD) {
        matched.add(sorted[i].id);
        matched.add(sorted[j].id);
        const overlap = authorOverlap(sorted[i].authors, sorted[j].authors);
        groups.push({
          key: groupKey([sorted[i].id, sorted[j].id]),
          papers: [sorted[i], sorted[j]].map((p) => ({
            id: p.id,
            title: p.title,
            authors: [...p.authors],
            url: p.url,
          })),
          similarity: Math.round(sim * 100),
          reason: overlap > 0.5 ? "same-authors-similar-title" : "similar-title",
        });
        break;
      }
    }
  }

  return groups;
}
