import { createClient } from "@/lib/supabase/server";

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
