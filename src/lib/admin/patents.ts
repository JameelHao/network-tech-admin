import { createClient } from "@/lib/supabase/server";
import { COMPANY_NAMES } from "./companies";
import { buildResult, type PaginatedResult, type PaginationParams } from "./pagination";

export type Patent = {
  id: string;
  publication_number: string;
  title: string;
  snippet: string | null;
  assignee: string;
  company_slug: string;
  inventors: string[];
  filing_date: string | null;
  priority_date: string | null;
  publication_date: string | null;
  url: string;
  created_at: string;
};

export function getCompanyPatentUrl(slug: string): string {
  const name = COMPANY_NAMES[slug] ?? slug;
  return `https://patents.google.com/?q=assignee:${encodeURIComponent(name)}&sort=new`;
}

export function getPatentUrl(publicationNumber: string): string {
  return `https://patents.google.com/patent/${publicationNumber}/en`;
}

export async function fetchAndStorePatents(
  slug: string,
): Promise<{ inserted: number; total: number; error?: string }> {
  const name = COMPANY_NAMES[slug];
  if (!name) return { inserted: 0, total: 0, error: `Unknown company: ${slug}` };

  const url = `https://patents.google.com/xhr/query?url=assignee%3D${encodeURIComponent(name)}%26sort%3Dnew`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return { inserted: 0, total: 0, error: `HTTP ${res.status}` };

  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch {
    return { inserted: 0, total: 0, error: "parse error" };
  }

  const results = json?.results?.[0]?.cluster?.[0]?.result ?? [];
  if (!Array.isArray(results) || results.length === 0)
    return { inserted: 0, total: 0, error: "no results" };

  const supabase = await createClient();

  const numbers = results
    .map((r: any) => r?.patent?.publication_number?.text)
    .filter(Boolean);

  if (numbers.length === 0) return { inserted: 0, total: 0, error: "no publication numbers" };

  // Find existing
  const { data: existing } = await supabase
    .from("patents")
    .select("publication_number")
    .in("publication_number", numbers);

  const existingSet = new Set((existing ?? []).map((r) => r.publication_number));
  const newNumbers = numbers.filter((n) => !existingSet.has(n));

  if (newNumbers.length === 0) {
    return { inserted: 0, total: numbers.length };
  }

  const rows = newNumbers.map((n: string) => {
    const result = results.find((r: any) => r?.patent?.publication_number?.text === n);
    const patent = result?.patent;
    return {
      publication_number: n,
      title: patent?.title?.text ?? n,
      assignee: name,
      company_slug: slug,
      inventors: patent?.inventor?.map?.((i: any) => i?.text?.text ?? "") ?? [],
      url: getPatentUrl(n),
    };
  });

  const { error: insertError } = await supabase.from("patents").insert(rows);
  if (insertError) return { inserted: 0, total: 0, error: insertError.message };

  return { inserted: newNumbers.length, total: numbers.length };
}

export async function importPatents(
  companySlug: string,
  publicationNumbers: string[],
): Promise<{ inserted: number; duplicates: number; error?: string }> {
  const supabase = await createClient();
  const name = COMPANY_NAMES[companySlug];
  if (!name) return { inserted: 0, duplicates: 0, error: `Unknown company: ${companySlug}` };

  const numbers = [...new Set(publicationNumbers.map((n) => n.trim()).filter(Boolean))];

  // Find existing
  const { data: existing } = await supabase
    .from("patents")
    .select("publication_number")
    .in("publication_number", numbers);

  const existingSet = new Set((existing ?? []).map((r) => r.publication_number));
  const newNumbers = numbers.filter((n) => !existingSet.has(n));

  if (newNumbers.length === 0) {
    return { inserted: 0, duplicates: numbers.length };
  }

  const rows = newNumbers.map((n) => ({
    publication_number: n,
    title: n,
    assignee: name,
    company_slug: companySlug,
    inventors: [],
    url: getPatentUrl(n),
  }));

  const { error: insertError } = await supabase.from("patents").insert(rows);
  if (insertError) return { inserted: 0, duplicates: 0, error: insertError.message };

  return { inserted: newNumbers.length, duplicates: numbers.length - newNumbers.length };
}

export async function listPatents(
  companySlug?: string,
  params?: PaginationParams,
): Promise<PaginatedResult<Patent>> {
  const supabase = await createClient();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("patents")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (companySlug) {
    query = query.eq("company_slug", companySlug);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return buildResult((data as Patent[]) ?? [], count ?? 0, { page, pageSize });
}

export async function getStoredPatentCount(companySlug: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("patents")
    .select("*", { count: "exact", head: true })
    .eq("company_slug", companySlug);
  return count ?? 0;
}

export async function updatePatentMetadata(
  publicationNumber: string,
  fields: { title?: string; snippet?: string; inventors?: string[]; filing_date?: string; priority_date?: string; publication_date?: string },
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("patents")
    .update(fields)
    .eq("publication_number", publicationNumber);
  return !error;
}
