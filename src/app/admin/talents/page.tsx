import { Topbar } from "@/components/admin/Topbar";
import { ExportButton } from "@/components/admin/ExportButton";
import { Pagination } from "@/components/admin/Pagination";
import { StatusPill } from "@/components/admin/StatusPill";
import { TopicTag } from "@/components/admin/TopicTag";
import { listTalentLeads } from "@/lib/admin/talents";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { FilterInput, FilterSelect } from "@/components/admin/FilterControls";
import { getDict } from "@/lib/i18n/server";
import { LEAD_STAGES } from "@/lib/admin/types";
import Link from "next/link";
import type { SortDir } from "@/lib/admin/pagination";

export default async function TalentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const filterStage = typeof sp.stage === "string" ? sp.stage : undefined;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp);
  const companyFilter = typeof sp.company === "string" ? sp.company : undefined;
  const topicFilter = typeof sp.topic === "string" ? sp.topic : undefined;
  const result = await listTalentLeads(params, { stage: filterStage, company: companyFilter, topic: topicFilter });
  const talents = result.data;

  const sortCol = typeof sp.sort === "string" ? sp.sort : undefined;
  const sortDir = typeof sp.dir === "string" ? sp.dir as SortDir : undefined;

  const allTopics = Array.from(new Set(talents.flatMap((t) => t.topics))).sort();

  const filterParams: Record<string, string> = {};
  if (filterStage) filterParams.stage = filterStage;
  if (companyFilter) filterParams.company = companyFilter;
  if (topicFilter) filterParams.topic = topicFilter;
  if (sortCol && sortDir) { filterParams.sort = sortCol; filterParams.dir = sortDir; }

  const activeFilters: { label: string; value: string }[] = [];
  if (filterStage) activeFilters.push({ label: t.common.stage, value: filterStage });
  if (companyFilter) activeFilters.push({ label: t.common.company, value: companyFilter });
  if (topicFilter) activeFilters.push({ label: t.common.topics, value: topicFilter });

  const clearParams = new URLSearchParams();
  if (sortCol && sortDir) { clearParams.set("sort", sortCol); clearParams.set("dir", sortDir); }
  const clearHref = clearParams.toString() ? `/admin/talents?${clearParams.toString()}` : "/admin/talents";

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.talents }]} t={t} lang={lang} />
      <main className="flex-1 px-6 xl:px-10 py-10">
        <div className="rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
            <h1 className="font-display text-[17px] tracking-tight text-ink-800">{t.nav.talents}</h1>
            <div className="flex items-center gap-2">
              <ExportButton entity="talents" format="csv" filters={filterParams} label={t.common.exportCSV} />
              <ExportButton entity="talents" format="json" filters={filterParams} label={t.common.exportJSON} />
              <Link
                href="/admin/talents/new"
                className="rounded-md bg-navy-700 px-3 py-1.5 text-[12.5px] text-navy-50 hover:bg-navy-600 transition-colors"
              >
                + {t.common.new}
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 px-5 py-2 border-b border-line bg-paper/30">
            {[undefined, ...LEAD_STAGES].map((s) => {
              const isActive = filterStage === s;
              const p = new URLSearchParams(filterParams);
              p.delete("stage"); p.delete("page");
              if (s) p.set("stage", s);
              const href = p.toString() ? `/admin/talents?${p.toString()}` : "/admin/talents";
              return (
                <Link key={s ?? "all"} href={href} className={`px-3 py-1 rounded font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors ${isActive ? "bg-navy-700 text-navy-50" : "text-ink-500 hover:text-ink-800"}`}>
                  {s ?? t.common.all}
                </Link>
              );
            })}
            <span className="text-ink-300 text-[10px]">|</span>
            <FilterInput paramKey="company" value={companyFilter ?? ""} placeholder={t.filter.companyPlaceholder} searchParams={filterParams} />
            {allTopics.length > 1 && (
              <FilterSelect paramKey="topic" label={t.filter.allTopics} value={topicFilter ?? ""} searchParams={filterParams} options={allTopics.map((tp) => ({ value: tp, label: tp }))} />
            )}
          </div>
          <FilterSummary filters={activeFilters} labels={{ activeFilters: t.filter.activeFilters, clearAll: t.filter.clearAll }} clearHref={clearHref} />

          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper/30 text-left">
                <SortableHeader column="name" label={t.common.name} currentSort={sortCol} currentDir={sortDir} basePath="/admin/talents" searchParams={filterParams} />
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.role}</th>
                <SortableHeader column="company" label={t.common.company} currentSort={sortCol} currentDir={sortDir} basePath="/admin/talents" searchParams={filterParams} />
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.list.source}</th>
                <SortableHeader column="stage" label={t.common.stage} currentSort={sortCol} currentDir={sortDir} basePath="/admin/talents" searchParams={filterParams} />
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.topics}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.list.linkedin}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {talents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[13px] text-ink-400">
                    {t.talent.noTalents}
                  </td>
                </tr>
              ) : (
                talents.map((tl) => (
                  <tr key={tl.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/talents/${tl.id}`} className="font-medium text-ink-800 hover:text-navy-600 transition-colors">
                        {tl.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink-600">{tl.role ?? "—"}</td>
                    <td className="px-5 py-3 text-ink-600">{tl.company ?? "—"}</td>
                    <td className="px-5 py-3 text-ink-600 text-[12px]">{tl.source ?? "—"}</td>
                    <td className="px-5 py-3">
                      <StatusPill label={tl.stage} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {tl.topics.length > 0
                          ? tl.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)
                          : <span className="text-[11px] text-ink-400">—</span>
                        }
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {tl.linkedin_url ? (
                        <a href={tl.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-navy-500 hover:text-navy-700">
                          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor"><path d="M13.6 1H2.4C1.6 1 1 1.6 1 2.4v11.2c0 .8.6 1.4 1.4 1.4h11.2c.8 0 1.4-.6 1.4-1.4V2.4c0-.8-.6-1.4-1.4-1.4ZM5.4 13H3.2V6.4h2.2V13ZM4.3 5.5c-.7 0-1.3-.6-1.3-1.3s.6-1.3 1.3-1.3 1.3.6 1.3 1.3-.6 1.3-1.3 1.3ZM13 13h-2.2V9.8c0-.8 0-1.8-1.1-1.8s-1.3.8-1.3 1.7V13H6.2V6.4h2.1v.9c.3-.6 1-1.1 2.1-1.1 2.2 0 2.6 1.5 2.6 3.4V13Z"/></svg>
                        </a>
                      ) : <span className="text-ink-300">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            basePath="/admin/talents"
            searchParams={filterParams}
            labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
          />
        </div>
      </main>
    </>
  );
}
