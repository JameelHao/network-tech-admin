import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";
import type { Lang } from "@/lib/i18n/dict";
import { COMPANY_NAMES } from "@/lib/admin/companies";
import { relativeTime } from "@/lib/admin/format";
import { CompanyTrendChart } from "@/components/admin/CompanyTrendChart";

const PAGE_SIZE = 10;

function Pagination({ slug, page, total, keyName, others, lang }: { slug: string; page: number; total: number; keyName: string; others: string; lang: Lang }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 px-5 py-3 border-t border-line">
      {page > 1 ? (
        <Link href={`/admin/companies/${slug}?${keyName}=${page - 1}&${others}`} className="text-[12px] font-mono text-navy-500 hover:text-navy-700 transition-colors">
          ← {lang === "zh" ? "上一页" : "Prev"}
        </Link>
      ) : (
        <span className="text-[12px] font-mono text-ink-300">← {lang === "zh" ? "上一页" : "Prev"}</span>
      )}
      <span className="text-[12px] font-mono text-ink-400">{page} / {totalPages}</span>
      {page < totalPages ? (
        <Link href={`/admin/companies/${slug}?${keyName}=${page + 1}&${others}`} className="text-[12px] font-mono text-navy-500 hover:text-navy-700 transition-colors">
          {lang === "zh" ? "下一页" : "Next"} →
        </Link>
      ) : (
        <span className="text-[12px] font-mono text-ink-300">{lang === "zh" ? "下一页" : "Next"} →</span>
      )}
    </div>
  );
}

export default async function CompanyDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const papersPage = Math.max(1, Number(sp?.papersPage) || 1);
  const newsPage = Math.max(1, Number(sp?.newsPage) || 1);
  const repoPage = Math.max(1, Number(sp?.repoPage) || 1);
  const { lang, t } = await getDict();

  const name = COMPANY_NAMES[slug];
  if (!name) notFound();

  const now = Date.now();
  const supabase = await createClient();

  const [papersRes, newsRes, papersCountRes, newsCountRes, reposRes, repoCountRes, productsRes] = await Promise.all([
    supabase.from("papers").select("id, title, published_date, venue, citation_count, authors, abstract").contains("companies", [slug]).order("published_date", { ascending: false }).range((papersPage - 1) * PAGE_SIZE, papersPage * PAGE_SIZE - 1),
    supabase.from("news_items").select("title, link, pub_date").eq("category", "news").contains("companies", [slug]).order("pub_date", { ascending: false }).range((newsPage - 1) * PAGE_SIZE, newsPage * PAGE_SIZE - 1),
    supabase.from("papers").select("*", { count: "exact", head: true }).contains("companies", [slug]),
    supabase.from("news_items").select("*", { count: "exact", head: true }).eq("category", "news").contains("companies", [slug]),
    supabase.from("github_repos").select("id, full_name, html_url, stars, language, pushed_at, description, topics").eq("company_slug", slug).order("stars", { ascending: false }).range((repoPage - 1) * PAGE_SIZE, repoPage * PAGE_SIZE - 1),
    supabase.from("github_repos").select("*", { count: "exact", head: true }).eq("company_slug", slug),
    supabase.from("products").select("id, name, category, description, url, topics, stage, pricing").ilike("vendor", name).order("name"),
  ]);

  // Topic trends — aggregate papers + news by topic+month
  const [topicPaperRows, topicNewsRows] = await Promise.all([
    supabase.from("papers").select("published_date, paper_topics(topic_slug)")
      .contains("companies", [slug]).not("published_date", "is", null).limit(2000),
    supabase.from("news_items").select("title, pub_date")
      .eq("category", "news").contains("companies", [slug]).not("pub_date", "is", null).limit(2000),
  ]);

  const months = 12;
  const today = new Date();
  const monthKeys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  // Topic keyword map — match news headlines to topics
  const TOPIC_KEYWORDS: Record<string, string[]> = {
    "dc-networking": ["data center"],
    "5g-6g": ["5g", "6g"],
    "network-ai": ["ai", "machine learning", "deep learning", "intelligence"],
    "edge-computing": ["edge"],
    "cloud-infra": ["cloud", "kubernetes", "container"],
    "sdn-nfv": ["sdn", "nfv", "software-defined"],
    "ddos-defense": ["ddos"],
    "zero-trust": ["zero trust"],
    "satellite-leo": ["satellite", "leo", "starlink"],
    "ebpf-xdp": ["ebpf", "xdp"],
    "security": ["security", "cybersecurity", "firewall", "encryption", "vulnerability", "breach", "malware"],
    "intent-based-networking": ["intent-based"],
    "automation": ["automation", "orchestration"],
    "observability": ["observability", "telemetry", "monitoring"],
    "transport-protocols": ["tcp", "quic", "http3", "transport protocol"],
    "distributed-sys": ["distributed system"],
    "mobile-wireless": ["wi-fi", "wifi", "wireless", "5g"],
    "high-speed-networking": ["400g", "800g", "silicon photonics", "optical"],
  };

  const topicBuckets = new Map<string, Map<string, number>>();

  // Count papers by topic+month
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

  // Count news by topic+month using keyword matching
  for (const row of topicNewsRows.data ?? []) {
    const m = (row as any).pub_date?.slice(0, 7);
    if (!m || !monthKeys.includes(m)) continue;
    const title = ((row as any).title ?? "").toLowerCase();
    const matched = new Set<string>();
    for (const [slug, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      if (keywords.some((kw) => title.includes(kw))) {
        matched.add(slug);
      }
    }
    for (const slug of matched) {
      if (!topicBuckets.has(slug)) topicBuckets.set(slug, new Map());
      const tmap = topicBuckets.get(slug)!;
      tmap.set(m, (tmap.get(m) ?? 0) + 1);
    }
  }

  // Pick top 8 topics by total count
  const topicTotals = Array.from(topicBuckets.entries())
    .map(([slug, months]) => [slug, Array.from(months.values()).reduce((a, b) => a + b, 0)] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([slug]) => slug);

  // Build chart data: array of { month, topic1: count, topic2: count, ... }
  const topicChartData = monthKeys.map((month) => {
    const point: Record<string, string | number> = { month };
    for (const slug of topicTotals) {
      point[slug] = topicBuckets.get(slug)?.get(month) ?? 0;
    }
    return point;
  });

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
          <p className="mt-4 text-[13.5px] text-ink-500">
            {repoCountRes.count ?? 0} repos · {productsRes.data?.length ?? 0} products · {papersCountRes.count ?? 0} papers · {newsCountRes.count ?? 0} news
          </p>
        </header>

        <section className="rounded-lg border border-line bg-surface p-5 mb-6">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">
            {lang === "zh" ? "研究方向趋势 (论文+新闻)" : "Topic Trends (Papers + News)"}
          </h3>
          <CompanyTrendChart
            data={topicChartData}
            topics={topicTotals}
            lang={lang}
          />
        </section>

        {/* GitHub Repos */}
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">GitHub Repos</p>
        <section className="mb-6 rounded-lg border border-line bg-surface overflow-hidden">
          {reposRes.data && reposRes.data.length > 0 ? (
            <>
              <div className="divide-y divide-line">
                {reposRes.data.map((r: any) => (
                  <a key={r.id} href={r.html_url} target="_blank" rel="noopener noreferrer" className="block px-5 py-3 hover:bg-paper/40 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[13px] font-medium text-ink-800 truncate">{r.full_name}</span>
                      <span className="shrink-0 text-[12px] font-mono text-ink-400 tabular-nums">★ {r.stars}</span>
                    </div>
                    {r.description && <p className="text-[12px] text-ink-500 mt-0.5 line-clamp-1">{r.description}</p>}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {r.language && <span className="text-[10px] font-mono text-ink-400">{r.language}</span>}
                      {r.topics?.slice(0, 4).map((topic: string) => (
                        <span key={topic} className="text-[10px] font-mono bg-navy-50 text-navy-600 px-1.5 py-0.5 rounded">{topic}</span>
                      ))}
                      {r.pushed_at && <span className="text-[10px] font-mono text-ink-400 ml-auto">{new Date(r.pushed_at).toLocaleDateString()}</span>}
                    </div>
                  </a>
                ))}
              </div>
              <Pagination slug={slug} page={repoPage} total={repoCountRes.count ?? 0} keyName="repoPage" others={`papersPage=${papersPage}&newsPage=${newsPage}`} lang={lang} />
            </>
          ) : (
            <p className="text-[13px] text-ink-400 py-8 text-center">{lang === "zh" ? "暂无仓库数据" : "No repos yet"}</p>
          )}
        </section>

        {/* Products */}
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.nav.products}</p>
        <section className="mb-6 rounded-lg border border-line bg-surface overflow-hidden">
          {productsRes.data && productsRes.data.length > 0 ? (
            <>
              <div className="divide-y divide-line">
                {productsRes.data.map((p: any) => (
                  <Link key={p.id} href={`/admin/products/${p.id}`} className="block px-5 py-3 hover:bg-paper/40 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[13px] font-medium text-ink-800">{p.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {p.stage && <span className="text-[10px] font-mono bg-navy-50 text-navy-600 px-1.5 py-0.5 rounded">{p.stage}</span>}
                        {p.pricing && <span className="text-[10px] font-mono text-ink-400">{p.pricing}</span>}
                      </div>
                    </div>
                    {p.description && <p className="text-[12px] text-ink-500 mt-0.5 line-clamp-1">{p.description}</p>}
                    {p.topics?.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {p.topics.slice(0, 4).map((topic: string) => (
                          <span key={topic} className="text-[10px] font-mono bg-ink-100 text-ink-500 px-1.5 py-0.5 rounded">{topic}</span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[13px] text-ink-400 py-8 text-center">{lang === "zh" ? "暂无产品" : "No products"}</p>
          )}
        </section>

        {/* Papers */}
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.nav.papers}</p>
        <section className="mb-6 rounded-lg border border-line bg-surface overflow-hidden">
          {papersRes.data && papersRes.data.length > 0 ? (
            <>
              <div className="divide-y divide-line">
                {papersRes.data.map((p: any) => (
                  <Link key={p.id} href={`/admin/papers/${p.id}`} className="block px-3 sm:px-5 py-4 hover:bg-paper/40 transition-colors">
                    <div className="flex items-start gap-2">
                      <p className="text-[13px] font-normal text-ink-800">{p.title}</p>
                    </div>
                    <p className="text-[12px] text-ink-500 mt-1">
                      {p.authors?.slice(0, 5).join(", ")}{p.authors?.length > 5 ? ` +${p.authors.length - 5}` : ""}
                      {p.venue && <> · <span className="text-navy-500">{p.venue}</span></>}
                      {p.published_date && <> · <span className="text-ink-400">{relativeTime(p.published_date, lang, now)}</span></>}
                      {p.citation_count != null && <> · {p.citation_count} cites</>}
                    </p>
                    {p.abstract && (
                      <p className="text-[12px] text-ink-400 mt-1.5 line-clamp-2">{p.abstract}</p>
                    )}
                  </Link>
                ))}
              </div>
              <Pagination slug={slug} page={papersPage} total={papersCountRes.count ?? 0} keyName="papersPage" others={`newsPage=${newsPage}&repoPage=${repoPage}`} lang={lang} />
            </>
          ) : (
            <p className="text-[13px] text-ink-400 py-8 text-center">{lang === "zh" ? "暂无论文" : "No papers"}</p>
          )}
        </section>

        {/* News */}
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.nav.news}</p>
        <section className="mb-6 rounded-lg border border-line bg-surface overflow-hidden">
          {newsRes.data && newsRes.data.length > 0 ? (
            <>
              <div className="divide-y divide-line">
                {newsRes.data.map((item, i) => (
                  <a key={item.link ?? i} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-2.5 hover:bg-paper/40 transition-colors">
                    <span className="flex-1 text-[13px] text-ink-800 truncate">{item.title}</span>
                    <span className="text-[11px] font-mono text-ink-400 shrink-0">{item.pub_date ? relativeTime(item.pub_date, lang, now) : "—"}</span>
                  </a>
                ))}
              </div>
              <Pagination slug={slug} page={newsPage} total={newsCountRes.count ?? 0} keyName="newsPage" others={`papersPage=${papersPage}&repoPage=${repoPage}`} lang={lang} />
            </>
          ) : (
            <p className="text-[13px] text-ink-400 py-8 text-center">{lang === "zh" ? "暂无新闻" : "No news"}</p>
          )}
        </section>
      </main>
    </>
  );
}
