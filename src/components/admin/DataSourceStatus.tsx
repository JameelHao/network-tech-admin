import { createClient } from "@/lib/supabase/server";
import { getFreshness, freshnessLabel } from "@/lib/admin/freshness";
import { relativeTime } from "@/lib/admin/format";
import type { Lang } from "@/lib/i18n/dict";

type Labels = {
  title: string;
  dataSource: string;
  lastSync: string;
  status: string;
  count: string;
};

async function getSourceStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [papersRes, newsRes, jobsRes] = await Promise.all([
    supabase.from("papers").select("created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("news_items").select("created_at").eq("category", "news").order("created_at", { ascending: false }).limit(1),
    supabase.from("news_items").select("created_at").eq("category", "job").order("created_at", { ascending: false }).limit(1),
  ]);
  const [papersCount, newsCount, jobsCount] = await Promise.all([
    supabase.from("papers").select("*", { count: "exact", head: true }),
    supabase.from("news_items").select("*", { count: "exact", head: true }).eq("category", "news"),
    supabase.from("news_items").select("*", { count: "exact", head: true }).eq("category", "job"),
  ]);
  return [
    { key: "papers", name: "arXiv Papers", lastSync: papersRes.data?.[0]?.created_at ?? null, count: papersCount.count ?? 0 },
    { key: "news", name: "News RSS", lastSync: newsRes.data?.[0]?.created_at ?? null, count: newsCount.count ?? 0 },
    { key: "jobs", name: "Jobs RSS", lastSync: jobsRes.data?.[0]?.created_at ?? null, count: jobsCount.count ?? 0 },
  ];
}

export async function DataSourceStatus({ labels, lang }: { labels: Labels; lang: Lang }) {
  const supabase = await createClient();
  const sources = await getSourceStats(supabase);

  return (
    <section className="rounded-lg border border-line bg-surface">
      <div className="px-5 pt-4 pb-3 border-b border-line">
        <h2 className="font-display text-[15px] tracking-tight text-ink-800">{labels.title}</h2>
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-line bg-paper/30 text-left">
            <th className="px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{labels.dataSource}</th>
            <th className="px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{labels.lastSync}</th>
            <th className="px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{labels.status}</th>
            <th className="px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 text-right">{labels.count}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sources.map((s) => {
            const f = getFreshness(s.lastSync);
            return (
              <tr key={s.key} className="hover:bg-paper/40 transition-colors">
                <td className="px-5 py-3 font-medium text-ink-800">{s.name}</td>
                <td className="px-5 py-3 text-ink-500 text-[12px]">
                  {s.lastSync ? relativeTime(s.lastSync, lang) : "—"}
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${f.dotClass}`} />
                    <span className={`font-mono text-[11px] ${f.color}`}>{freshnessLabel(f.level, lang)}</span>
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-600 tabular-nums text-right">{s.count.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
