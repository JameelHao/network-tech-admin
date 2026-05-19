import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";
import { COMPANY_NAMES, COMPANY_COLORS } from "@/lib/admin/companies";
import { getStoredPatentCount } from "@/lib/admin/patents";

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { lang, t } = await getDict();

  const name = COMPANY_NAMES[slug];
  if (!name) notFound();

  const supabase = await createClient();

  const [papersRes, newsRes, patentsRes, patentCount] = await Promise.all([
    supabase
      .from("papers")
      .select("id, title, published_date, venue, citation_count, source")
      .contains("companies", [slug])
      .order("published_date", { ascending: false })
      .limit(50),
    supabase
      .from("news_items")
      .select("title, link, snippet, source, pub_date")
      .eq("category", "news")
      .contains("companies", [slug])
      .order("pub_date", { ascending: false })
      .limit(50),
    supabase
      .from("patents")
      .select("publication_number, title, snippet, inventors, publication_date, url")
      .eq("company_slug", slug)
      .order("publication_date", { ascending: false })
      .limit(50),
    getStoredPatentCount(slug),
  ]);

  const color = COMPANY_COLORS[slug] ?? "bg-zinc-100 text-zinc-600 border border-zinc-200";

  return (
    <>
      <Topbar
        crumbs={[
          { label: t.nav.dashboard, href: "/admin" },
          { label: t.nav.companies, href: "/admin/companies" },
          { label: name },
        ]}
        t={t}
        lang={lang}
      />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10 w-full space-y-8">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 font-mono text-[12px] uppercase tracking-[0.1em] ${color}`}>{name}</span>
          <span className="text-[13px] text-ink-400 font-mono tabular-nums">
            {papersRes.data?.length ?? 0} papers · {newsRes.data?.length ?? 0} news · {patentCount} patents
          </span>
        </div>

        {/* Patents */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Patents</h2>
            <a
              href={`https://patents.google.com/?q=assignee:${encodeURIComponent(name)}&sort=new`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-navy-500 hover:text-navy-700 transition-colors"
            >
              {lang === "zh" ? "在 Google Patents 查看" : "View on Google Patents"} &rarr;
            </a>
          </div>
          {patentsRes.data && patentsRes.data.length > 0 ? (
            <div className="rounded-lg border border-line bg-surface divide-y divide-line overflow-hidden">
              {patentsRes.data.map((p) => (
                <a
                  key={p.publication_number}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-5 py-3.5 hover:bg-paper/40 transition-colors"
                >
                  <p className="text-[13px] font-medium text-ink-800">{p.title}</p>
                  {p.snippet && <p className="text-[12px] text-ink-400 mt-1 line-clamp-2">{p.snippet}</p>}
                  <p className="text-[11px] text-ink-300 mt-1 font-mono">
                    {p.publication_number}
                    {p.publication_date && <> · {p.publication_date}</>}
                    {p.inventors && p.inventors.length > 0 && (
                      <> · {p.inventors.slice(0, 3).join(", ")}{p.inventors.length > 3 ? ` +${p.inventors.length - 3}` : ""}</>
                    )}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-ink-400 py-4">
              {lang === "zh" ? "暂无专利数据，请先同步" : "No patents yet. Sync from Google Patents first."}
            </p>
          )}
        </section>

        {/* Papers */}
        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-3">{t.nav.papers}</h2>
          {papersRes.data && papersRes.data.length > 0 ? (
            <div className="rounded-lg border border-line bg-surface divide-y divide-line overflow-hidden">
              {papersRes.data.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/papers/${p.id}`}
                  className="block px-5 py-3.5 hover:bg-paper/40 transition-colors"
                >
                  <p className="text-[13px] font-medium text-ink-800">{p.title}</p>
                  <p className="text-[11px] text-ink-400 mt-1 font-mono">
                    {p.venue ?? "—"} · {p.published_date ?? "—"}
                    {p.citation_count != null && <> · {p.citation_count} citations</>}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-ink-400 py-4">{lang === "zh" ? "暂无论文" : "No papers"}</p>
          )}
        </section>

        {/* News */}
        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-3">{t.nav.news}</h2>
          {newsRes.data && newsRes.data.length > 0 ? (
            <div className="rounded-lg border border-line bg-surface divide-y divide-line overflow-hidden">
              {newsRes.data.map((item, i) => (
                <a
                  key={item.link ?? i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-5 py-3.5 hover:bg-paper/40 transition-colors"
                >
                  <p className="text-[13px] font-medium text-ink-800">{item.title}</p>
                  {item.snippet && <p className="text-[12px] text-ink-400 mt-1 line-clamp-2">{item.snippet}</p>}
                  <p className="text-[11px] text-ink-300 mt-1 font-mono">
                    {item.source && <span className="text-navy-500">{item.source}</span>}
                    {item.source && " · "}
                    {item.pub_date ?? "—"}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-ink-400 py-4">{lang === "zh" ? "暂无新闻" : "No news"}</p>
          )}
        </section>
      </main>
    </>
  );
}
