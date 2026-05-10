export type ImportedPaper = {
  title: string;
  authors: string[];
  venue: string;
  url: string | null;
  published_date: string | null;
  abstract: string | null;
  topics: string[];
};

function parseArxivXml(xml: string): ImportedPaper[] {
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
    });
  }

  return papers;
}

async function fetchFromArxiv(year: number): Promise<ImportedPaper[]> {
  const categories = ["cs.NI", "cs.AI", "cs.DC", "cs.PF", "cs.LG", "cs.CR"];
  const allPapers: ImportedPaper[] = [];
  const seen = new Set<string>();

  for (const cat of categories) {
    const query = `cat:${cat}+AND+submittedDate:[${year}01010000+TO+${year}12312359]`;
    const url = `http://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=200&sortBy=submittedDate&sortOrder=descending`;

    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const xml = await res.text();
      const papers = parseArxivXml(xml);

      for (const p of papers) {
        const key = p.title.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        allPapers.push(p);
      }
    } catch {
      // skip
    }

    await new Promise((r) => setTimeout(r, 3000));
  }

  return allPapers;
}

export async function fetchAllNetworkPapers(year: number): Promise<ImportedPaper[]> {
  return fetchFromArxiv(year);
}
