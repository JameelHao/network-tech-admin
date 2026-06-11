import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type Signal = {
  id: string; signal_type: "surge" | "emerging" | "company-shift";
  severity: number; title: string; description: string;
  topic_slug: string | null; company_slugs: string[];
  status: string; detected_at: string; evidence: Record<string, any>;
};

const PAGE_SIZE = 10;
const COLUMNS = [
  { key: "surge", icon: "📈", label: "Topic Surge", param: "s" },
  { key: "company-shift", icon: "🎯", label: "Company Signals", param: "c" },
  { key: "emerging", icon: "🌱", label: "Emerging Trends", param: "e" },
];

function SeverityBadge({ level }: { level: number }) {
  const c = level >= 8 ? "bg-rose-100 text-rose-700" : level >= 5 ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700";
  return <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${c}`}>{level}/10</span>;
}

function PageNav({ page, total, param, others }: { page: number; total: number; param: string; others: string }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-line">
      <span className="font-mono text-[9px] text-ink-400">{page}/{total}</span>
      <div className="flex gap-1.5">
        {page > 1 ? <Link href={`/admin/signals?${param}=${page - 1}${others}`} className="font-mono text-[10px] text-navy-500 hover:text-navy-700">←</Link> : <span className="font-mono text-[10px] text-ink-300">←</span>}
        {page < total ? <Link href={`/admin/signals?${param}=${page + 1}${others}`} className="font-mono text-[10px] text-navy-500 hover:text-navy-700">→</Link> : <span className="font-mono text-[10px] text-ink-300">→</span>}
      </div>
    </div>
  );
}

export default async function SignalsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { lang, t } = await getDict();
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: signals } = await supabase.from("tech_signals").select("*").not("status", "eq", "resolved").order("severity", { ascending: false }).order("detected_at", { ascending: false });
  const list = (signals ?? []) as Signal[];
  const g: Record<string, Signal[]> = { surge: [], emerging: [], "company-shift": [] };
  for (const s of list) if (g[s.signal_type]) g[s.signal_type].push(s);

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: "Signals" }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10 max-w-[1440px] mx-auto">
        <header className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">Tech Signals</p>
          <p className="mt-3 text-[13px] text-ink-500">AI-detected trends from papers + news</p>
        </header>
        {list.length === 0 ? (
          <div className="rounded-lg border border-line bg-surface p-8 text-center"><p className="text-[15px] text-ink-500">No signals yet</p></div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-5">
            {COLUMNS.map((col) => {
              const all = g[col.key] ?? [];
              const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
              const page = Math.min(totalPages, Math.max(1, parseInt(typeof sp[col.param] === "string" ? sp[col.param] as string : "1", 10) || 1));
              const items = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
              const nn = all.filter(s => s.status === "new").length;
              const others = COLUMNS.filter(c => c.param !== col.param).map(c => `&${c.param}=${typeof sp[c.param] === "string" ? sp[c.param] : "1"}`).join("");
              return (
                <section key={col.key}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[18px]">{col.icon}</span>
                    <h2 className="text-[13px] font-semibold text-ink-800">{col.label}</h2>
                    <span className="font-mono text-[10px] text-ink-400 bg-ink-50 px-1.5 py-0.5 rounded">{all.length}</span>
                    {nn > 0 && <span className="font-mono text-[9px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{nn} new</span>}
                  </div>
                  <div className="space-y-1.5">
                    {items.map(s => (
                      <Link key={s.id} href={`/admin/signals/${s.id}`} className="block rounded-lg border border-line bg-surface px-3.5 py-2.5 hover:bg-paper/40 transition-colors">
                        <div className="flex items-start gap-2 mb-0.5">
                          <h3 className="text-[12px] font-semibold text-ink-800 flex-1 min-w-0">{s.title}</h3>
                          <SeverityBadge level={s.severity} />
                        </div>
                        <p className="text-[11px] text-ink-500 leading-relaxed line-clamp-2">{s.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-ink-400 font-mono flex-wrap">
                          {s.topic_slug && <span className="bg-navy-50 text-navy-600 px-1 rounded">{s.topic_slug}</span>}
                          {s.company_slugs.map(c => <span key={c} className="bg-ink-100 text-ink-600 px-1 rounded">{c}</span>)}
                          <span className="ml-auto">{new Date(s.detected_at).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <PageNav page={page} total={totalPages} param={col.param} others={others} />
                </section>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
