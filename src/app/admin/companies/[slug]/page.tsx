import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";
import { COMPANY_NAMES } from "@/lib/admin/companies";
import { CompanyTimeline } from "@/components/admin/CompanyTimeline";
import { CompanyTrendChart } from "@/components/admin/CompanyTrendChart";
import type { TimelineEvent } from "@/components/admin/CompanyTimeline";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { lang, t } = await getDict();

  const name = COMPANY_NAMES[slug];
  if (!name) notFound();

  const supabase = await createClient();

  // Fetch all data in parallel
  const [vendorRes, papersCountRes, newsCountRes, reposRes,
    topicPaperRows, topicNewsRows] = await Promise.all([
    supabase.from("vendors").select("ai_insights").eq("name", name).maybeSingle(),
    supabase.from("papers").select("*", { count: "exact", head: true }).contains("companies", [slug]),
    supabase.from("news_items").select("*", { count: "exact", head: true }).eq("category", "news").contains("companies", [slug]),
    supabase.from("github_repos").select("id, full_name, html_url, stars, language, pushed_at, description").eq("company_slug", slug).order("pushed_at", { ascending: false }).limit(10),
    // Topic trends data
    supabase.from("papers").select("published_date, paper_topics(topic_slug)")
      .contains("companies", [slug]).not("published_date", "is", null).limit(2000),
    supabase.from("news_items").select("title, pub_date, ai_topics")
      .eq("category", "news").contains("companies", [slug]).not("pub_date", "is", null).limit(2000),
  ]);

  // Build timeline events (first page, server-side)
  const PAGE_SIZE = 10;
  const allEvents: TimelineEvent[] = [];

  // Papers
  const initialPapers = papersCountRes.count ?? 0 > 0
    ? await supabase.from("papers")
        .select("id, title, published_date, venue, citation_count, url")
        .contains("companies", [slug]).not("published_date", "is", null)
        .order("published_date", { ascending: false }).limit(PAGE_SIZE)
    : { data: [] };

  for (const p of initialPapers.data ?? []) {
    allEvents.push({
      type: "paper" as const,
      id: p.id,
      date: p.published_date,
      title: p.title,
      href: `/admin/papers/${p.id}`,
      meta: { venue: p.venue, citation_count: p.citation_count },
    });
  }

  // News
  const initialNews = newsCountRes.count ?? 0 > 0
    ? await supabase.from("news_items")
        .select("id, title, pub_date, source, link")
        .eq("category", "news").contains("companies", [slug]).not("pub_date", "is", null)
        .order("pub_date", { ascending: false }).limit(PAGE_SIZE)
    : { data: [] };

  for (const n of initialNews.data ?? []) {
    allEvents.push({
      type: "news" as const,
      id: n.id,
      date: n.pub_date,
      title: n.title,
      href: n.link || "#",
      meta: { source: n.source },
    });
  }

  // Repos
  for (const r of reposRes.data ?? []) {
    allEvents.push({
      type: "repo" as const,
      id: String(r.id),
      date: r.pushed_at,
      title: r.full_name,
      href: r.html_url,
      meta: { stars: r.stars, language: r.language, description: r.description },
    });
  }

  allEvents.sort((a, b) => b.date.localeCompare(a.date));
  const initialEvents = allEvents.slice(0, PAGE_SIZE);

  // AI insights
  const aiInsights = (vendorRes.data as any)?.ai_insights as {
    strengths?: string[];
    focus_areas?: string[];
    positioning?: string;
  } | null;

  // Compute popular topics
  const topicCounts = new Map<string, number>();
  for (const row of topicPaperRows.data ?? []) {
    for (const pt of (row as any).paper_topics ?? []) {
      const slug = pt.topic_slug;
      if (slug) topicCounts.set(slug, (topicCounts.get(slug) ?? 0) + 1);
    }
  }
  for (const row of topicNewsRows.data ?? []) {
    for (const slug of (row as any).ai_topics ?? []) {
      if (slug) topicCounts.set(slug, (topicCounts.get(slug) ?? 0) + 1);
    }
  }
  const popularTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Build topic trend chart data (same as before)
  const months = 12;
  const today = new Date();
  const monthKeys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const topicBuckets = new Map<string, Map<string, number>>();
  for (const row of topicPaperRows.data ?? []) {
    const m = (row as any).published_date?.slice(0, 7);
    if (!m || !monthKeys.includes(m)) continue;
    for (const pt of (row as any).paper_topics ?? []) {
      const slug = pt.topic_slug;
      if (!slug) continue;
      if (!topicBuckets.has(slug)) topicBuckets.set(slug, new Map());
      const tmap = topicBuckets.get(slug)!;
      tmap.set(m, (tmap.get(m) ?? 0) + 1);
    }
  }
  for (const row of topicNewsRows.data ?? []) {
    const m = (row as any).pub_date?.slice(0, 7);
    if (!m || !monthKeys.includes(m)) continue;
    for (const slug of (row as any).ai_topics ?? []) {
      if (!slug) continue;
      if (!topicBuckets.has(slug)) topicBuckets.set(slug, new Map());
      const tmap = topicBuckets.get(slug)!;
      tmap.set(m, (tmap.get(m) ?? 0) + 1);
    }
  }
  const topicTotals = Array.from(topicBuckets.entries())
    .map(([slug, months]) => [slug, Array.from(months.values()).reduce((a, b) => a + b, 0)] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([slug]) => slug);
  const topicChartData = monthKeys.map((month) => {
    const point: Record<string, string | number> = { month };
    for (const slug of topicTotals) {
      point[slug] = topicBuckets.get(slug)?.get(month) ?? 0;
    }
    return point;
  });

  const repoCount = reposRes.data?.length ?? 0;
  const paperCount = papersCountRes.count ?? 0;
  const newsCount = newsCountRes.count ?? 0;
  const totalEvents = paperCount + newsCount + repoCount;

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.companies, href: "/admin/companies" },
        { label: name },
      ]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">{name}</p>
        </header>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left: Timeline */}
          <div className="flex-1 min-w-0 rounded-lg border border-line bg-surface overflow-hidden">
            <div className="px-5 py-3 border-b border-line bg-paper/30">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {lang === "zh" ? "动态" : "Activity"}
              </h3>
            </div>
            <CompanyTimeline
              initialEvents={initialEvents}
              total={totalEvents}
              slug={slug}
              lang={lang}
            />
          </div>

          {/* Right: Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">

            {/* Topic Trend Chart — top */}
            {topicChartData.length > 0 && topicTotals.length > 0 && (
              <section className="rounded-lg border border-line bg-surface overflow-hidden">
                <div className="px-4 py-3 border-b border-line bg-paper/30">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    {lang === "zh" ? "主题趋势" : "Topic Trends"}
                  </h3>
                </div>
                <div className="p-3">
                  <CompanyTrendChart data={topicChartData} topics={topicTotals} lang={lang} />
                </div>
              </section>
            )}

            {/* AI Insights */}
            {aiInsights && (
              <section className="rounded-lg border border-line bg-surface overflow-hidden">
                <div className="px-4 py-3 border-b border-line bg-paper/30">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    {lang === "zh" ? "AI 分析" : "AI Insights"}
                  </h3>
                </div>
                <div className="px-4 py-3 space-y-4">
                  {aiInsights.strengths && aiInsights.strengths.length > 0 && (
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 mb-1.5">
                        {lang === "zh" ? "优势亮点" : "Strengths"}
                      </p>
                      <ul className="space-y-1">
                        {aiInsights.strengths.map((s: string, i: number) => (
                          <li key={i} className="text-[12px] text-ink-600 leading-relaxed flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.focus_areas && aiInsights.focus_areas.length > 0 && (
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 mb-1.5">
                        {lang === "zh" ? "关注领域" : "Focus Areas"}
                      </p>
                      <ul className="space-y-1">
                        {aiInsights.focus_areas.map((s: string, i: number) => (
                          <li key={i} className="text-[12px] text-ink-600 leading-relaxed flex items-start gap-1.5">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.positioning && (
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 mb-1.5">
                        {lang === "zh" ? "市场定位" : "Positioning"}
                      </p>
                      <p className="text-[12px] text-ink-600 leading-relaxed">{aiInsights.positioning}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Popular Topics */}
            {popularTopics.length > 0 && (
              <section className="rounded-lg border border-line bg-surface overflow-hidden">
                <div className="px-4 py-3 border-b border-line bg-paper/30">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    {lang === "zh" ? "热门主题" : "Popular Topics"}
                  </h3>
                </div>
                <div className="px-4 py-3 space-y-1">
                  {popularTopics.map(([slug, count]) => (
                    <div key={slug} className="flex items-center justify-between">
                      <span className="text-[12px] text-ink-700 truncate">{slug}</span>
                      <span className="font-mono text-[11px] text-ink-400 shrink-0 ml-2">{count}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </aside>
        </div>
      </main>
    </>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-[12px] text-ink-600">{label}</span>
      <span className="font-mono text-[13px] font-semibold text-ink-800 tabular-nums">{value}</span>
    </div>
  );
}
