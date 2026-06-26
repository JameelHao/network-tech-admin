import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const OWNER = "plutozc";
const REPO = "analise";
const DIR = "weekly-report/reports";
const BRANCH = "master";

const GH_API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DIR}`;
const GH_RAW = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${DIR}`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  // List reports from GitHub Contents API
  if (!date) {
    const res = await fetch(`${GH_API}?t=${Date.now()}`, {
      headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "weekly-report-app" },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ reports: [] });

    const files: { name: string }[] = await res.json();
    const reports = files
      .filter((f) => f.name.startsWith("weekly-") && f.name.endsWith(".md"))
      .map((f) => f.name.replace("weekly-", "").replace(".md", ""))
      .sort()
      .reverse();

    return NextResponse.json({ reports }, { headers: { "Cache-Control": "no-cache" } });
  }

  // Fetch specific report via raw URL (cache buster for GitHub CDN)
  const url = `${GH_RAW}/weekly-${date}.md?t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const content = await res.text();
  return NextResponse.json({ date, content }, { headers: { "Cache-Control": "no-cache" } });
}
