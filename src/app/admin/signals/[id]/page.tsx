import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type Signal = {
  id: string; signal_type: string; severity: number;
  title: string; description: string;
  topic_slug: string | null; company_slugs: string[];
  status: string; detected_at: string; evidence: Record<string, any>;
};

export default async function SignalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const supabase = await createClient();

  const { data: signal } = await supabase.from("tech_signals").select("*").eq("id", id).single();
  if (!signal) notFound();
  const s = signal as Signal;
  const company = s.company_slugs?.[0] ?? "";
  const topic = s.topic_slug ?? "";

  let papers: any[] = [];
  let news: any[] = [];

  if (s.signal_type === "surge" || s.signal_type === "emerging") {
    // Keyword-driven: search using regex terms from evidence
    const regex = (s.evidence?.keyword_regex as string) ?? "";
    const searchTerms = regex ? regex.split("|").filter(Boolean) : [];

    // Skip overly generic words (e.g. "timely" matches 41 papers, none about DC Transport)
    const GENERIC = new Set(["timely","loss","rtt","5g","6g","tcp","dns","bgp","p4","nfv","xdp","bpf","tls","ssl","vpn","ipu","mec","tsn","gpu","cpu","dhcp","nat","vlan","mpls","http","https","api","rest","json","xml","snmp"]);
    const filtered = searchTerms.filter(t => !(t.length <= 6 && GENERIC.has(t.toLowerCase())));
    const effectiveTerms = filtered.length > 0 ? filtered : searchTerms.slice(0, 2);

    if (effectiveTerms.length > 0) {
      // Search title+abstract for papers, title+snippet for news (matching signal counting logic)
      const paperOr = effectiveTerms.slice(0, 5).map(t =>
        `title.ilike.%${t.slice(0, 30).replace(/'/g, "''")}%,abstract.ilike.%${t.slice(0, 30).replace(/'/g, "''")}%`
      ).join(",");
      const newsOr = effectiveTerms.slice(0, 5).map(t =>
        `title.ilike.%${t.slice(0, 30).replace(/'/g, "''")}%,snippet.ilike.%${t.slice(0, 30).replace(/'/g, "''")}%`
      ).join(",");
      const { data: p } = await supabase.from("papers")
        .select("id, title, published_date, venue, citation_count, companies, paper_topics(topic_slug)")
        .or(paperOr)
        .order("published_date", { ascending: false }).limit(20);
      papers = p ?? [];
      const { data: n } = await supabase.from("news_items")
        .select("id, title, link, pub_date, source")
        .or(newsOr)
        .order("pub_date", { ascending: false }).limit(20);
      news = n ?? [];
    }
  }

  if (s.signal_type === "company-shift") {
    const regex = (s.evidence?.keyword_regex as string) ?? "";
    const searchTerms = regex ? regex.split("|").filter(Boolean) : [];
    const GENERIC = new Set(["timely","loss","rtt","5g","6g","tcp","dns","bgp","p4","nfv","xdp","bpf","tls","ssl","vpn","ipu","mec","tsn","gpu","cpu","dhcp","nat","vlan","mpls","http","https","api","rest","json","xml","snmp"]);
    const filtered = searchTerms.filter(t => !(t.length <= 6 && GENERIC.has(t.toLowerCase())));
    const effectiveTerms = filtered.length > 0 ? filtered : searchTerms.slice(0, 2);

    // Company + topic intersection
    if (company && topic) {
      const { data: p } = await supabase.from("papers")
        .select("id, title, published_date, venue, citation_count, companies, paper_topics(topic_slug)")
        .eq("paper_topics.topic_slug", topic)
        .contains("companies", [company])
        .order("published_date", { ascending: false }).limit(20);
      papers = p ?? [];

      // Try keyword regex match as fallback
      if (papers.length === 0 && effectiveTerms.length > 0) {
        const paperOr = effectiveTerms.slice(0, 5).map(t =>
          `title.ilike.%${t.slice(0, 30).replace(/'/g, "''")}%,abstract.ilike.%${t.slice(0, 30).replace(/'/g, "''")}%`
        ).join(",");
        const { data: p2 } = await supabase.from("papers")
          .select("id, title, published_date, venue, citation_count, companies, paper_topics(topic_slug)")
          .contains("companies", [company])
          .or(paperOr)
          .order("published_date", { ascending: false }).limit(20);
        papers = p2 ?? [];
      }

      // News: match ai_topics + companies
      const { data: n } = await supabase.from("news_items")
        .select("id, title, link, pub_date, source, relevance_score")
        .contains("ai_topics", [topic])
        .contains("companies", [company])
        .order("pub_date", { ascending: false }).limit(20);
      news = n ?? [];

      if (news.length === 0 && effectiveTerms.length > 0) {
        const newsOr = effectiveTerms.slice(0, 5).map(t =>
          `title.ilike.%${t.slice(0, 30).replace(/'/g, "''")}%,snippet.ilike.%${t.slice(0, 30).replace(/'/g, "''")}%`
        ).join(",");
        const { data: n2 } = await supabase.from("news_items")
          .select("id, title, link, pub_date, source")
          .contains("companies", [company])
          .or(newsOr)
          .order("pub_date", { ascending: false }).limit(20);
        news = n2 ?? [];
      }
    }
  }

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: "Signals", href: "/admin/signals" },
        { label: s.title.slice(0, 40) },
      ]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10 max-w-[1200px] mx-auto">
        <header className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-2">{s.signal_type}</p>
          <h1 className="text-[20px] font-bold text-ink-900 mb-2">{s.title}</h1>
          <p className="text-[13px] text-ink-600 leading-relaxed">{s.description}</p>
          <div className="flex items-center gap-3 mt-3 text-[11px] text-ink-400 font-mono">
            {s.topic_slug && <span className="bg-navy-50 text-navy-600 px-2 py-0.5 rounded">{s.topic_slug}</span>}
            {s.company_slugs.map(c => (
              <Link key={c} href={`/admin/companies/${c}`} className="bg-ink-100 text-ink-600 px-2 py-0.5 rounded hover:text-navy-600">{c}</Link>
            ))}
            <span className="ml-auto">{new Date(s.detected_at).toLocaleDateString()}</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="rounded-lg border border-line bg-surface overflow-hidden">
            <div className="px-4 py-3 border-b border-line bg-paper/30">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Papers ({papers.length})</p>
            </div>
            {papers.length === 0 ? (
              <p className="text-[12px] text-ink-400 p-6 text-center">No papers found</p>
            ) : (
              <div className="divide-y divide-line max-h-[600px] overflow-y-auto">
                {papers.map((p: any) => (
                  <Link key={p.id} href={`/admin/papers/${p.id}`} className="block px-4 py-3 hover:bg-paper/40 transition-colors">
                    <p className="text-[12px] font-medium text-ink-800 line-clamp-2">{p.title}</p>
                    <p className="text-[10px] text-ink-400 mt-1 font-mono">
                      {p.venue && <span className="text-navy-500">{p.venue}</span>}
                      {p.published_date && <> · {p.published_date}</>}
                      {p.citation_count != null && <> · {p.citation_count} cites</>}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-line bg-surface overflow-hidden">
            <div className="px-4 py-3 border-b border-line bg-paper/30">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">News ({news.length})</p>
            </div>
            {news.length === 0 ? (
              <p className="text-[12px] text-ink-400 p-6 text-center">No news found</p>
            ) : (
              <div className="divide-y divide-line max-h-[600px] overflow-y-auto">
                {news.map((n: any) => (
                  <a key={n.id} href={n.link} target="_blank" rel="noopener noreferrer" className="block px-4 py-3 hover:bg-paper/40 transition-colors">
                    <p className="text-[12px] font-medium text-ink-800 line-clamp-2">{n.title}</p>
                    <p className="text-[10px] text-ink-400 mt-1 font-mono">
                      {n.source && <span className="text-navy-500">{n.source}</span>}
                      {n.pub_date && <> · {n.pub_date}</>}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
