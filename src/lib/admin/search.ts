export type SearchResult = {
  title: string;
  link: string;
  snippet: string;
};

export async function searchWeb(query: string): Promise<SearchResult[]> {
  const key = process.env.SERPER_API_KEY;
  if (!key) throw new Error("SERPER_API_KEY not configured");

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: 5 }),
  });

  if (!res.ok) throw new Error(`Serper API error: ${res.status}`);

  const data = await res.json();
  return (data.organic ?? []).map((r: { title: string; link: string; snippet: string }) => ({
    title: r.title,
    link: r.link,
    snippet: r.snippet,
  }));
}

export function extractDates(text: string): { start_date?: string; end_date?: string } {
  // Match patterns like "April 28-30, 2025" or "2025-04-28"
  const patterns = [
    /(\w+ \d{1,2})[\s–-]+(\d{1,2}),?\s*(\d{4})/i,
    /(\w+ \d{1,2}),?\s*(\d{4})\s*[\s–-]+\s*(\w+ \d{1,2}),?\s*(\d{4})/i,
    /(\d{4}-\d{2}-\d{2})\s*(?:to|–|-)\s*(\d{4}-\d{2}-\d{2})/,
  ];

  const months: Record<string, string> = {
    january: "01", february: "02", march: "03", april: "04",
    may: "05", june: "06", july: "07", august: "08",
    september: "09", october: "10", november: "11", december: "12",
  };

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern === patterns[2]) {
        return { start_date: match[1], end_date: match[2] };
      }
      if (pattern === patterns[0]) {
        const monthDay = match[1];
        const endDay = match[2];
        const year = match[3];
        const [monthStr, startDay] = monthDay.split(" ");
        const month = months[monthStr.toLowerCase()];
        if (month) {
          const sd = `${year}-${month}-${startDay.padStart(2, "0")}`;
          const ed = `${year}-${month}-${endDay.padStart(2, "0")}`;
          return { start_date: sd, end_date: ed };
        }
      }
    }
  }
  return {};
}

export function extractLocation(text: string): string | undefined {
  const match = text.match(/(?:held in|taking place in|location[:\s]+|venue[:\s]+)\s*([^,.]+(?:,\s*[^,.]+)?)/i);
  return match?.[1]?.trim();
}

export type PaperResult = {
  title: string;
  authors: string[];
  affiliations: string[];
  topics: string[];
  url: string | null;
};

export async function searchPapers(confName: string, year: number): Promise<PaperResult[]> {
  const key = process.env.SERPER_API_KEY;
  if (!key) return [];

  const queries = [
    `${confName} ${year} accepted papers program`,
    `${confName} ${year} proceedings paper list`,
  ];

  const allSnippets: { title: string; link: string; snippet: string }[] = [];

  for (const q of queries) {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": key, "Content-Type": "application/json" },
      body: JSON.stringify({ q, num: 10 }),
    });

    if (!res.ok) continue;
    const data = await res.json();
    const organic = data.organic ?? [];
    allSnippets.push(...organic);
  }

  const papers: PaperResult[] = [];
  const seen = new Set<string>();

  for (const result of allSnippets) {
    const extracted = extractPapersFromSnippet(result.snippet, result.link);
    for (const p of extracted) {
      const key = p.title.toLowerCase();
      if (!seen.has(key) && p.title.length > 10) {
        seen.add(key);
        papers.push(p);
      }
    }
  }

  return papers;
}

function extractPapersFromSnippet(snippet: string, sourceUrl: string): PaperResult[] {
  const papers: PaperResult[] = [];

  // Try to extract paper titles from snippets
  // Common patterns: "Title. Author1, Author2..." or "Title — Author1, Author2"
  const lines = snippet.split(/[;•·|]/).map((l) => l.trim()).filter((l) => l.length > 15);

  for (const line of lines) {
    // Skip non-paper lines
    if (/^\d{4}|conference|workshop|symposium|call for|deadline|submission/i.test(line)) continue;

    const titleMatch = line.match(/^(.+?)(?:\.\s+|\s+[-–—]\s+)(.+)/);
    if (titleMatch) {
      const title = titleMatch[1].replace(/^["']|["']$/g, "").trim();
      const rest = titleMatch[2];

      if (title.length < 10 || title.length > 200) continue;

      const authors = rest
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 1 && a.length < 50 && !/\d{4}/.test(a));

      papers.push({
        title,
        authors: authors.slice(0, 15),
        affiliations: [],
        topics: [],
        url: sourceUrl,
      });
    } else if (line.length > 15 && line.length < 150 && !/https?:/.test(line)) {
      // Might be a standalone title
      const cleaned = line.replace(/^[\d.)\s]+/, "").trim();
      if (cleaned.length > 15 && /[A-Z]/.test(cleaned[0])) {
        papers.push({
          title: cleaned,
          authors: [],
          affiliations: [],
          topics: [],
          url: sourceUrl,
        });
      }
    }
  }

  return papers;
}
