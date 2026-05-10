const NETWORK_VENUES: Record<string, { dblp: string; label: string }> = {
  sigcomm: { dblp: "conf/sigcomm", label: "SIGCOMM" },
  nsdi: { dblp: "conf/nsdi", label: "NSDI" },
  imc: { dblp: "conf/imc", label: "IMC" },
  conext: { dblp: "conf/conext", label: "CoNEXT" },
  infocom: { dblp: "conf/infocom", label: "INFOCOM" },
  mobicom: { dblp: "conf/mobicom", label: "MobiCom" },
  sosr: { dblp: "conf/sosr", label: "SOSR" },
  hotnets: { dblp: "conf/hotnets", label: "HotNets" },
  eurosys: { dblp: "conf/eurosys", label: "EuroSys" },
  osdi: { dblp: "conf/osdi", label: "OSDI" },
  sosp: { dblp: "conf/sosp", label: "SOSP" },
  atc: { dblp: "conf/usenix", label: "USENIX ATC" },
};

export type ImportedPaper = {
  title: string;
  authors: string[];
  venue: string;
  url: string | null;
  published_date: string | null;
  abstract: string | null;
  topics: string[];
};

export function getAvailableVenues() {
  return Object.entries(NETWORK_VENUES).map(([key, v]) => ({ key, label: v.label }));
}

export async function fetchFromDblp(venueKey: string, year: number): Promise<ImportedPaper[]> {
  const venue = NETWORK_VENUES[venueKey];
  if (!venue) return [];

  const tocUrl = `https://dblp.org/search/publ/api?q=toc%3Adb/${venue.dblp}/${venueKey}${year}.bht%3A&format=json&h=500`;
  const searchUrl = `https://dblp.org/search/publ/api?q=venue%3A${venue.label}%20year%3A${year}&format=json&h=500`;

  const papers: ImportedPaper[] = [];
  const seen = new Set<string>();

  for (const url of [tocUrl, searchUrl]) {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) continue;
      const data = await res.json();
      const hits = data?.result?.hits?.hit ?? [];

      for (const hit of hits) {
        const info = hit.info;
        if (!info?.title) continue;

        const title = info.title.replace(/\.$/, "").trim();
        const key = title.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        let authors: string[] = [];
        if (info.authors?.author) {
          const arr = Array.isArray(info.authors.author) ? info.authors.author : [info.authors.author];
          authors = arr.map((a: { text?: string } | string) => typeof a === "string" ? a : a.text ?? "").filter(Boolean);
        }

        papers.push({
          title,
          authors,
          venue: venue.label,
          url: info.ee ?? info.url ?? null,
          published_date: info.year ? `${info.year}-01-01` : null,
          abstract: null,
          topics: [],
        });
      }
    } catch {
      // skip failed requests
    }
  }

  return papers;
}

export async function fetchFromSemanticScholar(venueKey: string, year: number): Promise<ImportedPaper[]> {
  const venue = NETWORK_VENUES[venueKey];
  if (!venue) return [];

  const papers: ImportedPaper[] = [];
  const seen = new Set<string>();

  const query = encodeURIComponent(`${venue.label} ${year}`);
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${query}&year=${year}&fields=title,authors,abstract,url,venue,year&limit=100`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "NetworkTechRadar/1.0" },
    });
    if (!res.ok) return [];
    const data = await res.json();

    for (const item of data.data ?? []) {
      if (!item.title) continue;
      const title = item.title.trim();
      const key = title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const authors = (item.authors ?? []).map((a: { name: string }) => a.name);

      papers.push({
        title,
        authors,
        venue: item.venue || venue.label,
        url: item.url ?? null,
        published_date: item.year ? `${item.year}-01-01` : null,
        abstract: item.abstract ?? null,
        topics: [],
      });
    }
  } catch {
    // skip
  }

  return papers;
}

export async function fetchPapersForVenue(venueKey: string, year: number): Promise<ImportedPaper[]> {
  const [dblpPapers, s2Papers] = await Promise.all([
    fetchFromDblp(venueKey, year),
    fetchFromSemanticScholar(venueKey, year),
  ]);

  // Merge, preferring DBLP but adding Semantic Scholar abstracts
  const merged = new Map<string, ImportedPaper>();

  for (const p of dblpPapers) {
    merged.set(p.title.toLowerCase(), p);
  }

  for (const p of s2Papers) {
    const key = p.title.toLowerCase();
    const existing = merged.get(key);
    if (existing) {
      if (!existing.abstract && p.abstract) existing.abstract = p.abstract;
      if (!existing.url && p.url) existing.url = p.url;
    } else {
      merged.set(key, p);
    }
  }

  return Array.from(merged.values());
}

export async function fetchAllNetworkPapers(year: number): Promise<ImportedPaper[]> {
  const allPapers: ImportedPaper[] = [];

  for (const venueKey of Object.keys(NETWORK_VENUES)) {
    const papers = await fetchPapersForVenue(venueKey, year);
    allPapers.push(...papers);
    // Rate limit: small delay between venues
    await new Promise((r) => setTimeout(r, 1000));
  }

  return allPapers;
}
