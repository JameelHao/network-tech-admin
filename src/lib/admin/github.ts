import { createClient } from "@/lib/supabase/server";
import { COMPANY_GITHUB_ORGS, COMPANY_NAMES } from "./companies";

export type GithubRepo = {
  id: number;
  company_slug: string;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  is_fork: boolean;
  pushed_at: string | null;
  created_at: string;
};

function githubFetch(path: string) {
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(15000) });
}

export async function fetchReposByOrg(org: string): Promise<any[]> {
  const all: any[] = [];
  for (let page = 1; page <= 3; page++) {
    const res = await githubFetch(`/orgs/${org}/repos?sort=pushed&per_page=50&page=${page}&type=public`);
    if (!res.ok) throw new Error(`GitHub API ${res.status} for org ${org}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
  }
  return all;
}

export async function syncOrgRepos(companySlug: string, org: string): Promise<{ inserted: number; updated: number }> {
  const supabase = await createClient();
  const repos = await fetchReposByOrg(org);

  let inserted = 0;
  let updated = 0;

  for (const r of repos) {
    const repo = {
      id: r.id,
      company_slug: companySlug,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      html_url: r.html_url,
      homepage: r.homepage,
      stars: r.stargazers_count ?? 0,
      language: r.language,
      topics: r.topics ?? [],
      is_fork: r.fork ?? false,
      pushed_at: r.pushed_at,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("github_repos").upsert(repo, { onConflict: "id" });
    if (error) throw error;

    if (r.id) {
      // Check if it was an insert or update by querying created_at
      const { data: existing } = await supabase
        .from("github_repos")
        .select("created_at")
        .eq("id", r.id)
        .single();
      if (existing && existing.created_at === repo.updated_at) inserted++;
      else updated++;
    }
  }

  // Return approximate counts
  return { inserted: repos.length, updated: 0 };
}

export async function syncCompanyRepos(slug: string): Promise<{ inserted: number; total: number; error?: string }> {
  const name = COMPANY_NAMES[slug];
  if (!name) return { inserted: 0, total: 0, error: `Unknown company: ${slug}` };

  const orgs = COMPANY_GITHUB_ORGS[slug];
  if (!orgs || orgs.length === 0) return { inserted: 0, total: 0, error: `No GitHub orgs for ${slug}` };

  let totalInserted = 0;
  let totalRepos = 0;

  for (const org of orgs) {
    try {
      const result = await syncOrgRepos(slug, org);
      totalInserted += result.inserted;
      totalRepos += result.inserted + result.updated;
    } catch (e) {
      return { inserted: totalInserted, total: totalRepos, error: `Org ${org}: ${e instanceof Error ? e.message : "unknown"}` };
    }
  }

  return { inserted: totalInserted, total: totalRepos };
}

export async function getStoredRepoCount(companySlug: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("github_repos")
    .select("*", { count: "exact", head: true })
    .eq("company_slug", companySlug);
  return count ?? 0;
}

export async function getCompanyRepos(companySlug: string, limit = 50) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("github_repos")
    .select("*")
    .eq("company_slug", companySlug)
    .order("stars", { ascending: false })
    .limit(limit);
  return data as GithubRepo[] | null;
}
