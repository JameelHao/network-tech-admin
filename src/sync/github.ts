import { supabase } from "../lib/supabase.js";
import type { FeedStat } from "../types/index.js";

const COMPANY_GITHUB_ORGS: Record<string, string[]> = {
  cisco: ["cisco"], google: ["google"], ericsson: ["ericsson"],
  nokia: ["nokia", "nokia-networks"], aws: ["aws"], azure: ["microsoft"],
  microsoft: ["microsoft"], openai: ["openai"], nvidia: ["nvidia"],
  meta: ["facebook"], micron: ["micron"], broadcom: ["broadcom"],
  intel: ["intel"], ibm: ["IBM"], huawei: ["huawei"],
  cloudflare: ["cloudflare"], apple: ["apple"], amd: ["amd"],
  tencent: ["Tencent"], alibaba: ["alibaba"], baidu: ["baidu"],
  bytedance: ["bytedance"],
};

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function syncGitHubRepos(): Promise<FeedStat[]> {
  if (!GITHUB_TOKEN) return [{ source: "github", status: "error", count: 0, error: "GITHUB_TOKEN not set" }];

  const stats: FeedStat[] = [];
  const headers = { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json" };

  for (const [slug, orgs] of Object.entries(COMPANY_GITHUB_ORGS)) {
    for (const org of orgs) {
      try {
        const res = await fetch(
          `https://api.github.com/orgs/${org}/repos?per_page=100&sort=pushed&type=public&direction=desc`,
          { headers, signal: AbortSignal.timeout(15000) },
        );
        if (!res.ok) {
          if (res.status === 403) {
            stats.push({ source: `github:${org}`, status: "error", count: 0, error: "rate limited" });
            break;
          }
          stats.push({ source: `github:${org}`, status: "error", count: 0, error: `HTTP ${res.status}` });
          continue;
        }
        const repos: any[] = await res.json();
        let synced = 0;
        for (const repo of repos) {
          const { error } = await supabase.from("github_repos").upsert({
            id: repo.id.toString(),
            full_name: repo.full_name,
            html_url: repo.html_url,
            description: repo.description,
            stars: repo.stargazers_count,
            language: repo.language,
            topics: repo.topics ?? [],
            pushed_at: repo.pushed_at,
            company_slug: slug,
            gh_created_at: repo.created_at,
          }, { onConflict: "id" });
          if (!error) synced++;
        }
        stats.push({ source: `github:${org}`, status: "ok", count: synced });
      } catch (err) {
        stats.push({ source: `github:${org}`, status: "error", count: 0, error: err instanceof Error ? err.message : "unknown" });
      }
    }
  }

  await supabase.from("sync_meta").upsert(
    { entity: "github", last_sync_at: new Date().toISOString(), last_result: { feedStats: stats } },
    { onConflict: "entity" },
  );

  return stats;
}
