export type ImportedPaper = {
  title: string;
  authors: string[];
  venue: string;
  url: string | null;
  published_date: string | null;
  abstract: string | null;
  topics: string[];
  citation_count?: number;
  source: "arxiv" | "semantic-scholar";
};

export type CategoryStat = {
  category: string;
  status: "ok" | "error";
  count: number;
  error?: string;
};

export type PaperFetchResult = {
  papers: ImportedPaper[];
  categoryStats: CategoryStat[];
};

export function parseArxivXml(xml: string): ImportedPaper[] {
  const papers: ImportedPaper[] = [];
  const entries = xml.split("<entry>").slice(1);

  for (const entry of entries) {
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, " ").trim();
    if (!title) continue;

    const authors: string[] = [];
    const authorMatches = entry.matchAll(/<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g);
    for (const m of authorMatches) {
      authors.push(m[1].trim());
    }

    const url = entry.match(/<id>(.*?)<\/id>/)?.[1]?.trim() ?? null;
    const published = entry.match(/<published>(.*?)<\/published>/)?.[1]?.trim() ?? null;
    const abstract = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.replace(/\s+/g, " ").trim() ?? null;

    const categories: string[] = [];
    const catMatches = entry.matchAll(/category term="([^"]+)"/g);
    for (const m of catMatches) {
      categories.push(m[1]);
    }

    papers.push({
      title,
      authors,
      venue: "arXiv",
      url,
      published_date: published ? published.slice(0, 10) : null,
      abstract,
      topics: categories.filter((c) => c.startsWith("cs.")),
      source: "arxiv",
    });
  }

  return papers;
}

export const ARXIV_CATEGORIES = ["cs.NI", "cs.AI", "cs.DC", "cs.PF", "cs.LG", "cs.CR"] as const;

export async function fetchSingleArxivCategory(category: string, year: number): Promise<PaperFetchResult> {
  const query = `cat:${category}+AND+submittedDate:[${year}01010000+TO+${year}12312359]`;
  const url = `https://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=200&sortBy=submittedDate&sortOrder=descending`;

  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      return { papers: [], categoryStats: [{ category, status: "error", count: 0, error: `HTTP ${res.status}` }] };
    }
    const xml = await res.text();
    const papers = parseArxivXml(xml);
    return { papers, categoryStats: [{ category, status: "ok", count: papers.length }] };
  } catch (err) {
    return { papers: [], categoryStats: [{ category, status: "error", count: 0, error: err instanceof Error ? err.message : "unknown" }] };
  }
}

async function fetchFromArxiv(year: number): Promise<PaperFetchResult> {
  const allPapers: ImportedPaper[] = [];
  const categoryStats: CategoryStat[] = [];
  const seen = new Set<string>();

  for (const cat of ARXIV_CATEGORIES) {
    const result = await fetchSingleArxivCategory(cat, year);
    categoryStats.push(...result.categoryStats);
    for (const p of result.papers) {
      const key = p.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      allPapers.push(p);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }

  return { papers: allPapers, categoryStats };
}

export const S2_VENUES = ["SIGCOMM", "NSDI", "IMC", "OSDI", "SOSP", "CoNEXT"] as const;
const S2_FIELDS = "title,authors,venue,year,citationCount,url,abstract,externalIds";

type S2Author = { name: string };
type S2Paper = {
  title: string;
  authors: S2Author[];
  venue: string | null;
  year: number | null;
  citationCount: number | null;
  url: string | null;
  abstract: string | null;
  externalIds: Record<string, string> | null;
};
type S2Response = { data: S2Paper[] };

export function parseS2Papers(data: S2Paper[], venue: string): ImportedPaper[] {
  return data.map((p) => {
    const arxivId = p.externalIds?.ArXiv;
    const paperUrl = arxivId
      ? `https://arxiv.org/abs/${arxivId}`
      : p.url;
    return {
      title: p.title,
      authors: p.authors.map((a) => a.name),
      venue,
      url: paperUrl,
      published_date: p.year ? `${p.year}-01-01` : null,
      abstract: p.abstract?.slice(0, 2000) ?? null,
      topics: [],
      citation_count: p.citationCount ?? undefined,
      source: "semantic-scholar" as const,
    };
  });
}

export async function fetchSingleS2Venue(venue: string, year: number): Promise<PaperFetchResult> {
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  if (!apiKey) {
    return { papers: [], categoryStats: [{ category: venue, status: "error", count: 0, error: "no API key" }] };
  }

  const headers: Record<string, string> = { "x-api-key": apiKey };
  const params = new URLSearchParams({
    query: "networking OR SDN OR eBPF OR datacenter",
    year: String(year),
    venue,
    fieldsOfStudy: "Computer Science",
    fields: S2_FIELDS,
    limit: "100",
  });
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?${params}`;

  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      return { papers: [], categoryStats: [{ category: venue, status: "error", count: 0, error: `HTTP ${res.status}` }] };
    }
    const json: S2Response = await res.json();
    const papers = parseS2Papers(json.data ?? [], venue);
    return { papers, categoryStats: [{ category: venue, status: "ok", count: papers.length }] };
  } catch (err) {
    return { papers: [], categoryStats: [{ category: venue, status: "error", count: 0, error: err instanceof Error ? err.message : "unknown" }] };
  }
}

async function fetchFromSemanticScholar(year: number): Promise<PaperFetchResult> {
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  if (!apiKey) {
    return { papers: [], categoryStats: [{ category: "semantic-scholar", status: "error", count: 0, error: "no API key" }] };
  }

  const allPapers: ImportedPaper[] = [];
  const categoryStats: CategoryStat[] = [];

  for (const venue of S2_VENUES) {
    const result = await fetchSingleS2Venue(venue, year);
    categoryStats.push(...result.categoryStats);
    allPapers.push(...result.papers);
    await new Promise((r) => setTimeout(r, 3000));
  }

  return { papers: allPapers, categoryStats };
}

export function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

export function mergeResults(arxiv: PaperFetchResult, s2: PaperFetchResult): PaperFetchResult {
  const seen = new Set<string>();
  const merged: ImportedPaper[] = [];

  for (const p of arxiv.papers) {
    const key = normalizeTitle(p.title);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(p);
    }
  }

  for (const p of s2.papers) {
    const key = normalizeTitle(p.title);
    if (seen.has(key)) {
      const existing = merged.find((m) => normalizeTitle(m.title) === key);
      if (existing && p.citation_count !== undefined) {
        existing.citation_count = p.citation_count;
      }
    } else {
      seen.add(key);
      merged.push(p);
    }
  }

  return {
    papers: merged,
    categoryStats: [...arxiv.categoryStats, ...s2.categoryStats],
  };
}

export async function fetchAllNetworkPapers(year: number): Promise<PaperFetchResult> {
  const [arxiv, s2] = await Promise.all([
    fetchFromArxiv(year),
    fetchFromSemanticScholar(year),
  ]);
  return mergeResults(arxiv, s2);
}
