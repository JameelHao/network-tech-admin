import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";

export const dynamic = "force-dynamic";

const VOLUME_COUNT = 3; // fetch latest N periodical volumes

type HGItem = {
  rid: string;
  name: string;
  full_name: string;
  description: string;
  description_en: string;
  github_url: string;
  stars: number;
  forks: number;
};

type VolumeData = {
  props: {
    pageProps: {
      volume: {
        data: { category_name: string; items: HGItem[] }[];
      };
    };
  };
};

async function fetchVolume(num: number): Promise<HGItem[]> {
  const url = `https://hellogithub.com/periodical/volume/${num}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) return [];
  const html = await res.text();

  // Extract __NEXT_DATA__ JSON
  const match = html.match(/__NEXT_DATA__" type="application\/json">({.*?})<\/script>/);
  if (!match) return [];

  try {
    const parsed: VolumeData = JSON.parse(match[1]);
    const items: HGItem[] = [];
    for (const cat of parsed.props?.pageProps?.volume?.data ?? []) {
      for (const item of cat.items ?? []) {
        items.push(item);
      }
    }
    return items;
  } catch {
    return [];
  }
}

type GitHubRepoInfo = {
  language: string | null;
  topics: string[];
  pushed_at: string;
};

async function fetchGitHubRepo(
  fullName: string,
  headers: Record<string, string>,
): Promise<GitHubRepoInfo | null> {
  const url = `https://api.github.com/repos/${fullName}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    language: data.language ?? null,
    topics: data.topics ?? [],
    pushed_at: data.pushed_at ?? "",
  };
}

export async function POST() {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // Fetch latest volumes
  const allItems = new Map<string, HGItem>();
  const errors: string[] = [];

  for (let i = 0; i < VOLUME_COUNT; i++) {
    try {
      const items = await fetchVolume(121 - i); // latest is 121
      for (const item of items) {
        if (!allItems.has(item.github_url)) {
          allItems.set(item.github_url, item);
        }
      }
    } catch {
      errors.push(`volume ${121 - i} failed`);
    }
  }

  if (allItems.size === 0) {
    return NextResponse.json({ success: true, imported: 0, updated: 0, checked: 0, errors });
  }

  const supabase = await createClient();
  const { data: existing } = await supabase.from("opensource").select("repo_url, stars");
  const existingMap = new Map((existing ?? []).map((e) => [e.repo_url, e.stars]));

  let imported = 0;
  let updated = 0;
  let checked = 0;

  const newRows: {
    name: string;
    repo_url: string;
    description: string | null;
    language: string | null;
    stars: number;
    last_active: string;
    topics: string[];
  }[] = [];

  for (const item of allItems.values()) {
    checked++;
    const repoUrl = item.github_url;

    if (existingMap.has(repoUrl)) {
      if (existingMap.get(repoUrl) !== item.stars) {
        await supabase
          .from("opensource")
          .update({ stars: item.stars })
          .eq("repo_url", repoUrl);
        updated++;
      }
      continue;
    }

    // Fetch GitHub metadata for new repos
    const ghInfo = await fetchGitHubRepo(item.full_name, headers);
    // Sleep 300ms to avoid rate limiting
    await new Promise((r) => setTimeout(r, 300));

    // Use GitHub topics if available, otherwise empty (HelloGitHub is general-purpose)
    const topics: string[] = [];

    const lastActive = ghInfo?.pushed_at?.split("T")[0] ?? new Date().toISOString().split("T")[0];

    newRows.push({
      name: item.name,
      repo_url: repoUrl,
      description: (item.description || item.description_en || null)?.slice(0, 500) ?? null,
      language: ghInfo?.language ?? null,
      stars: item.stars,
      last_active: lastActive,
      topics: ghInfo?.topics?.length ? ghInfo.topics.slice(0, 10) : topics,
    });
  }

  if (newRows.length > 0) {
    const { error } = await supabase.from("opensource").insert(newRows);
    if (error) {
      errors.push(`insert: ${error.message}`);
    } else {
      imported = newRows.length;
    }
  }

  const now = new Date().toISOString();
  await supabase.from("sync_meta").upsert(
    {
      entity: "opensource",
      last_sync_at: now,
      last_result: { imported, updated, checked, errors },
    },
    { onConflict: "entity" },
  );

  return NextResponse.json({ success: true, imported, updated, checked, errors });
}
