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

  // Use stored IDs from evidence (set during signal generation)
  const paperIds: string[] = (s.evidence?.paper_ids as string[]) ?? [];
  const newsIds: string[] = (s.evidence?.news_ids as string[]) ?? [];

  const [papers, news] = await Promise.all([
    paperIds.length > 0
      ? supabase.from("papers")
          .select("id, title, published_date, venue, citation_count, companies, paper_topics(topic_slug)")
          .in("id", paperIds.slice(0, 50))
          .order("published_date", { ascending: false }).then(r => r.data ?? [])
      : Promise.resolve([] as any[]),
    newsIds.length > 0
      ? supabase.from("news_items")
          .select("id, title, link, pub_date, source")
          .in("id", newsIds.slice(0, 50))
          .order("pub_date", { ascending: false }).then(r => r.data ?? [])
      : Promise.resolve([] as any[]),
  ]);

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
          {!paperIds.length && !newsIds.length && (
            <p className="mt-4 text-[11px] text-ink-400 bg-ink-50 rounded px-3 py-2">
              ℹ️ Signal generated before ID tracking. Re-run signals to populate.
            </p>
          )}
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
