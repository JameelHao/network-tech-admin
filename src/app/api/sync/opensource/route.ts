import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";

export const dynamic = "force-dynamic";

const SEARCH_QUERIES = [
  "topic:networking stars:>500 pushed:>2026-01-01",
  "topic:sdn stars:>200 pushed:>2026-01-01",
  "topic:ebpf stars:>500 pushed:>2026-01-01",
  "topic:network-security stars:>500 pushed:>2026-01-01",
  "topic:service-mesh stars:>1000 pushed:>2026-01-01",
];

const TOPIC_MAP: Record<string, string> = {
  networking: "dc-networking",
  network: "dc-networking",
  "data-center": "dc-networking",
  datacenter: "dc-networking",
  sdn: "sdn-nfv",
  nfv: "sdn-nfv",
  openflow: "sdn-nfv",
  ebpf: "ebpf-xdp",
  xdp: "ebpf-xdp",
  bpf: "ebpf-xdp",
  "cloud-native": "cloud-infra",
  kubernetes: "cloud-infra",
  k8s: "cloud-infra",
  "service-mesh": "cloud-infra",
  dpdk: "high-speed-networking",
  "high-performance": "high-speed-networking",
  bgp: "dns-bgp",
  routing: "dns-bgp",
  ospf: "dns-bgp",
  dns: "dns-bgp",
  firewall: "protocol-security",
  ids: "protocol-security",
  "network-security": "protocol-security",
  security: "protocol-security",
  monitoring: "network-monitoring",
  observability: "network-monitoring",
  "distributed-systems": "distributed-sys",
  "distributed-system": "distributed-sys",
};

export function mapTopics(ghTopics: string[]): string[] {
  const slugs = new Set<string>();
  for (const t of ghTopics) {
    const mapped = TOPIC_MAP[t.toLowerCase()];
    if (mapped) slugs.add(mapped);
  }
  return slugs.size > 0 ? [...slugs] : ["dc-networking"];
}

type SyncStat = { name: string; status: "ok" | "error" | "skipped"; error?: string };

async function searchGitHub(query: string, headers: Record<string, string>): Promise<GitHubRepo[]> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const data = await res.json();
  return (data.items ?? []) as GitHubRepo[];
}

type GitHubRepo = {
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  topics: string[];
};

export async function POST() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const allRepos = new Map<string, GitHubRepo>();
  const stats: SyncStat[] = [];

  for (const query of SEARCH_QUERIES) {
    try {
      const repos = await searchGitHub(query, headers);
      for (const repo of repos) {
        if (!allRepos.has(repo.html_url)) {
          allRepos.set(repo.html_url, repo);
        }
      }
    } catch (e) {
      stats.push({ name: query, status: "error", error: e instanceof Error ? e.message : "unknown" });
    }
  }

  if (allRepos.size === 0) {
    return NextResponse.json({ success: true, imported: 0, updated: 0, checked: 0, stats });
  }

  const supabase = await createClient();
  const { data: existing } = await supabase.from("opensource").select("repo_url, stars");
  const existingMap = new Map((existing ?? []).map((e) => [e.repo_url, e.stars]));

  let imported = 0;
  let updated = 0;

  const newRows: { name: string; repo_url: string; description: string | null; language: string | null; stars: number; last_active: string; topics: string[] }[] = [];
  const updateTasks: Promise<void>[] = [];

  for (const repo of allRepos.values()) {
    const repoUrl = repo.html_url;
    const lastActive = repo.pushed_at ? repo.pushed_at.split("T")[0] : null;
    const topics = mapTopics(repo.topics ?? []);

    if (existingMap.has(repoUrl)) {
      if (existingMap.get(repoUrl) !== repo.stargazers_count) {
        updateTasks.push(
          (async () => {
            await supabase.from("opensource").update({
              stars: repo.stargazers_count,
              last_active: lastActive,
            }).eq("repo_url", repoUrl);
            updated++;
          })(),
        );
      }
    } else {
      const name = repo.full_name.split("/").pop() ?? repo.full_name;
      newRows.push({
        name,
        repo_url: repoUrl,
        description: repo.description?.slice(0, 500) ?? null,
        language: repo.language,
        stars: repo.stargazers_count,
        last_active: lastActive ?? new Date().toISOString().split("T")[0],
        topics,
      });
    }
  }

  await Promise.all(updateTasks);

  if (newRows.length > 0) {
    const { error } = await supabase.from("opensource").insert(newRows);
    if (error) {
      stats.push({ name: "insert", status: "error", error: error.message });
    } else {
      imported = newRows.length;
    }
  }

  const now = new Date().toISOString();
  await supabase.from("sync_meta").upsert(
    { entity: "opensource", last_sync_at: now, last_result: { imported, updated, checked: allRepos.size, stats } },
    { onConflict: "entity" },
  );

  return NextResponse.json({ success: true, imported, updated, checked: allRepos.size, stats });
}
