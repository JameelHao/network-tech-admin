import { inferPaperTopics, getValidTopicSlugs } from "./paper-topics";
import { inferCompanies } from "./companies";

export type ImportedPaper = {
  title: string;
  authors: string[];
  venue: string;
  url: string | null;
  published_date: string | null;
  abstract: string | null;
  topics: string[];
  companies: string[];
  citation_count?: number;
  source: "arxiv" | "semantic-scholar";
};

export type CategoryStat = {
  category: string;
  status: "ok" | "error" | "skipped";
  count: number;
  error?: string;
};

export type PaperFetchResult = {
  papers: ImportedPaper[];
  categoryStats: CategoryStat[];
};

export function inferPaperCompanies(title: string, abstract: string | null): string[] {
  return inferCompanies(`${title} ${abstract ?? ""}`);
}

export function parseArxivXml(xml: string, validSlugs?: string[], topicLimit?: number): ImportedPaper[] {
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
      topics: inferPaperTopics(categories.filter((c) => c.startsWith("cs.")), title, abstract, validSlugs, topicLimit),
      companies: inferPaperCompanies(title, abstract),
      source: "arxiv",
    });
  }

  return papers;
}

export const ARXIV_CATEGORIES = ["cs.NI", "cs.AI", "cs.DC", "cs.PF", "cs.LG", "cs.CR"] as const;

async function fetchArxivOnce(url: string, category: string, validSlugs?: string[], topicLimit?: number): Promise<PaperFetchResult> {
  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    return { papers: [], categoryStats: [{ category, status: "error", count: 0, error: `HTTP ${res.status}` }] };
  }
  const xml = await res.text();
  const papers = parseArxivXml(xml, validSlugs, topicLimit);
  return { papers, categoryStats: [{ category, status: "ok", count: papers.length }] };
}

export async function fetchSingleArxivCategory(category: string, year: number, topicLimit?: number): Promise<PaperFetchResult> {
  const validSlugs = await getValidTopicSlugs();
  const query = `cat:${category}+AND+submittedDate:[${year}01010000+TO+${year}12312359]`;
  const url = `https://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=200&sortBy=submittedDate&sortOrder=descending`;

  try {
    return await fetchArxivOnce(url, category, validSlugs, topicLimit);
  } catch {
    // Retry once after 2s
    await new Promise((r) => setTimeout(r, 2000));
    try {
      return await fetchArxivOnce(url, category, undefined, topicLimit);
    } catch (err) {
      return { papers: [], categoryStats: [{ category, status: "error", count: 0, error: err instanceof Error ? err.message : "unknown" }] };
    }
  }
}

async function fetchFromArxiv(year: number, topicLimit?: number): Promise<PaperFetchResult> {
  const allPapers: ImportedPaper[] = [];
  const categoryStats: CategoryStat[] = [];
  const seen = new Set<string>();

  for (const cat of ARXIV_CATEGORIES) {
    const result = await fetchSingleArxivCategory(cat, year, topicLimit);
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

export function parseS2Papers(data: S2Paper[], venue: string, validSlugs?: string[], topicLimit?: number): ImportedPaper[] {
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
      topics: inferPaperTopics([], p.title, p.abstract ?? null, validSlugs, topicLimit),
      companies: inferPaperCompanies(p.title, p.abstract ?? null),
      citation_count: p.citationCount ?? undefined,
      source: "semantic-scholar" as const,
    };
  });
}

export async function fetchSingleS2Venue(venue: string, year: number, topicLimit?: number): Promise<PaperFetchResult> {
  const validSlugs = await getValidTopicSlugs();
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  if (!apiKey) {
    return { papers: [], categoryStats: [{ category: venue, status: "skipped", count: 0, error: "SEMANTIC_SCHOLAR_API_KEY not configured" }] };
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
    const papers = parseS2Papers(json.data ?? [], venue, validSlugs, topicLimit);
    return { papers, categoryStats: [{ category: venue, status: "ok", count: papers.length }] };
  } catch (err) {
    return { papers: [], categoryStats: [{ category: venue, status: "error", count: 0, error: err instanceof Error ? err.message : "unknown" }] };
  }
}

async function fetchFromSemanticScholar(year: number, topicLimit?: number): Promise<PaperFetchResult> {
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  if (!apiKey) {
    return { papers: [], categoryStats: [{ category: "semantic-scholar", status: "skipped", count: 0, error: "SEMANTIC_SCHOLAR_API_KEY not configured" }] };
  }

  const allPapers: ImportedPaper[] = [];
  const categoryStats: CategoryStat[] = [];

  for (const venue of S2_VENUES) {
    const result = await fetchSingleS2Venue(venue, year, topicLimit);
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

const EMPTY_RESULT: PaperFetchResult = { papers: [], categoryStats: [] };

export async function fetchAllNetworkPapers(year: number, topicLimit?: number): Promise<PaperFetchResult> {
  const [arxivSettled, s2Settled, companySettled] = await Promise.allSettled([
    fetchFromArxiv(year, topicLimit),
    fetchFromSemanticScholar(year, topicLimit),
    fetchAllCompanyPapers(year, topicLimit),
  ]);
  const arxiv = arxivSettled.status === "fulfilled" ? arxivSettled.value : EMPTY_RESULT;
  const s2 = s2Settled.status === "fulfilled" ? s2Settled.value : EMPTY_RESULT;
  const company = companySettled.status === "fulfilled" ? companySettled.value : EMPTY_RESULT;
  const merged = mergeResults(arxiv, s2);
  return mergeResults(merged, company);
}

// ── Company-specific arXiv keyword search ──

const COMPANY_ARXIV_QUERIES: Record<string, string> = {
  cisco: "all:cisco+AND+all:(network+OR+datacenter+OR+sdn+OR+segment+routing+OR+bgp+OR+ios+xe)",
  google: 'all:"google"+AND+all:(network+OR+datacenter+OR+sdn+OR+cloud+OR+infrastructure+OR+mgcp+OR+boria)',
  ericsson: "all:ericsson+AND+all:(network+OR+5g+OR+6g+OR+radio+OR+ran+OR+oranic+OR+bgp+OR+sdn)",
  nokia: "all:nokia+AND+all:(network+OR+5g+OR+6g+OR+radio+OR+ran+OR+sdn+OR+ip+optical)",
  aws: 'all:"aws"+AND+all:(network+OR+vpc+OR+cloud+OR+datacenter+OR+sdn+OR+route+53+OR+direct+connect)',
  azure: 'all:azure+AND+all:(network+OR+cloud+OR+datacenter+OR+sdn+OR+virtual+network+OR+express+route)',
  microsoft: "all:microsoft+AND+all:(network+OR+datacenter+OR+sdn+OR+cloud+OR+rdma+OR+sonic)",
  openai: "all:openai+AND+all:(network+OR+distributed+OR+training+OR+inference+OR+datacenter+OR+gpu)",
  anthropic: "all:anthropic+AND+all:(network+OR+distributed+OR+training+OR+inference+OR+datacenter)",
  nvidia: "all:nvidia+AND+all:(network+OR+datacenter+OR+gpu+OR+rdma+OR+infiniBand+OR+doca+OR+connectx)",
  meta: "all:meta+AND+all:(network+OR+datacenter+OR+sdn+OR+optical+OR+fboss+OR+wedge,marianas)",
  micron: "all:micron+AND+all:(network+OR+memory+OR+storage+OR+datacenter+OR+ddr5)",
  broadcom: "all:broadcom+AND+all:(network+OR+switch+OR+router+OR+chip+OR+silicon+OR+jericho+OR+tomahawk+OR+trident)",
  intel: "all:intel+AND+all:(network+OR+datacenter+OR+sdn+OR+chip+OR+ethernet+OR+tofino+OR+ipu)",
  ibm: "all:ibm+AND+all:(network+OR+cloud+OR+watson+OR+red+hat+OR+telecom+OR+nsf)",
  huawei: "all:huawei+AND+all:(network+OR+5g+OR+6g+OR+datacenter+OR+router+OR+sdn+OR+ip)",
  cloudflare: "all:cloudflare+AND+all:(network+OR+dns+OR+cdn+OR+ddos+OR+edge+OR+workers+OR+zero+trust)",
  apple: "all:apple+AND+all:(network+OR+icloud+OR+edge+OR+privacy+OR+protocol+OR+wifi+OR+bluetooth)",
  amd: "all:amd+AND+all:(network+OR+datacenter+OR+chip+OR+pensando+OR+xilinx+OR+fpga+OR+smartnic)",
  tencent: "all:tencent+AND+all:(network+OR+cloud+OR+datacenter+OR+game+OR+streaming+OR+wechat)",
  alibaba: "all:alibaba+AND+all:(network+OR+cloud+OR+datacenter+OR+sdn+OR+express+OR+transport)",
  baidu: "all:baidu+AND+all:(network+OR+cloud+OR+sdn+OR+autonomous+OR+transport+OR+paddle)",
  bytedance: "all:bytedance+AND+all:(network+OR+cloud+OR+video+OR+streaming+OR+tiktok+OR+edge)",
};

export const COMPANY_SLUGS = Object.keys(COMPANY_ARXIV_QUERIES);

export async function fetchCompanyArxivPapers(companySlug: string, year: number, topicLimit?: number): Promise<PaperFetchResult> {
  const query = COMPANY_ARXIV_QUERIES[companySlug];
  if (!query) return { papers: [], categoryStats: [] };

  const validSlugs = await getValidTopicSlugs();
  const dateFilter = `+AND+submittedDate:[${year}01010000+TO+${year}12312359]`;
  const url = `https://export.arxiv.org/api/query?search_query=${query}${dateFilter}&start=0&max_results=50&sortBy=submittedDate&sortOrder=descending`;

  try {
    const result = await fetchArxivOnce(url, `company:${companySlug}`, validSlugs, topicLimit);
    // Tag all returned papers with this company (in addition to inferred companies)
    for (const p of result.papers) {
      if (!p.companies.includes(companySlug)) {
        p.companies.push(companySlug);
      }
    }
    return result;
  } catch (err) {
    return {
      papers: [],
      categoryStats: [{ category: `company:${companySlug}`, status: "error", count: 0, error: err instanceof Error ? err.message : "unknown" }],
    };
  }
}

export async function fetchAllCompanyPapers(year: number, topicLimit?: number): Promise<PaperFetchResult> {
  const allPapers: ImportedPaper[] = [];
  const categoryStats: CategoryStat[] = [];
  const seen = new Set<string>();

  for (const slug of Object.keys(COMPANY_ARXIV_QUERIES)) {
    const result = await fetchCompanyArxivPapers(slug, year, topicLimit);
    categoryStats.push(...result.categoryStats);
    for (const p of result.papers) {
      const key = normalizeTitle(p.title);
      if (seen.has(key)) continue;
      seen.add(key);
      allPapers.push(p);
    }
    await new Promise((r) => setTimeout(r, 3500));
  }

  return { papers: allPapers, categoryStats };
}
