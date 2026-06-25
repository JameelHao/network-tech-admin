import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { COMPANY_NAMES } from "@/lib/admin/companies";

export const dynamic = "force-dynamic";

type EventType = "paper" | "news" | "repo";
type TimelineEvent = {
  type: EventType;
  id: string;
  date: string;
  title: string;
  href: string;
  meta: Record<string, any>;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 10));

  const supabase = await createClient();
  const name = COMPANY_NAMES[slug];
  if (!name) return NextResponse.json({ events: [], total: 0 });

  const fetchSize = page * pageSize;

  const [papersRes, newsRes, reposRes] = await Promise.all([
    supabase.from("papers")
      .select("id, title, published_date, venue, citation_count, url")
      .contains("companies", [slug])
      .not("published_date", "is", null)
      .order("published_date", { ascending: false })
      .limit(fetchSize),
    supabase.from("news_items")
      .select("id, title, pub_date, source, link")
      .eq("category", "news")
      .contains("companies", [slug])
      .not("pub_date", "is", null)
      .order("pub_date", { ascending: false })
      .limit(fetchSize),
    supabase.from("github_repos")
      .select("id, full_name, html_url, stars, language, pushed_at, description")
      .eq("company_slug", slug)
      .not("pushed_at", "is", null)
      .order("pushed_at", { ascending: false })
      .limit(fetchSize),
  ]);

  const events: TimelineEvent[] = [];

  for (const p of papersRes.data ?? []) {
    events.push({
      type: "paper",
      id: p.id,
      date: p.published_date,
      title: p.title,
      href: `/admin/papers/${p.id}`,
      meta: { venue: p.venue, citation_count: p.citation_count, url: p.url },
    });
  }

  for (const n of newsRes.data ?? []) {
    events.push({
      type: "news",
      id: n.id,
      date: n.pub_date,
      title: n.title,
      href: n.link || "#",
      meta: { source: n.source },
    });
  }

  for (const r of reposRes.data ?? []) {
    events.push({
      type: "repo",
      id: String(r.id),
      date: r.pushed_at,
      title: r.full_name,
      href: r.html_url,
      meta: { stars: r.stars, language: r.language, description: r.description },
    });
  }

  events.sort((a, b) => b.date.localeCompare(a.date));

  const total = events.length;
  const sliced = events.slice(0, pageSize);

  return NextResponse.json({ events: sliced, total });
}
