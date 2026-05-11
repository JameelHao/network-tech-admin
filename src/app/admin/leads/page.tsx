import { Topbar } from "@/components/admin/Topbar";
import { EmptyState } from "@/components/admin/EmptyState";
import { ExportButton } from "@/components/admin/ExportButton";
import { Pagination } from "@/components/admin/Pagination";
import { StatusPill } from "@/components/admin/StatusPill";
import { listLeads } from "@/lib/admin/leads";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { FilterSelect, FilterDateRange } from "@/components/admin/FilterControls";
import { getDict } from "@/lib/i18n/server";
import { relativeTime } from "@/lib/admin/format";
import { LEAD_STAGES } from "@/lib/admin/types";
import Link from "next/link";
import type { SortDir } from "@/lib/admin/pagination";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp);
  const sortCol = typeof sp.sort === "string" ? sp.sort : undefined;
  const sortDir = typeof sp.dir === "string" ? sp.dir as SortDir : undefined;
  const filterStage = typeof sp.stage === "string" ? sp.stage : undefined;
  const sourceType = typeof sp.sourceType === "string" ? sp.sourceType : undefined;
  const dateFrom = typeof sp.dateFrom === "string" ? sp.dateFrom : undefined;
  const dateTo = typeof sp.dateTo === "string" ? sp.dateTo : undefined;
  const result = await listLeads(params, { stage: filterStage, sourceType, dateFrom, dateTo });
  const leads = result.data;

  const filterParams: Record<string, string> = {};
  if (filterStage) filterParams.stage = filterStage;
  if (sourceType) filterParams.sourceType = sourceType;
  if (dateFrom) filterParams.dateFrom = dateFrom;
  if (dateTo) filterParams.dateTo = dateTo;
  if (sortCol && sortDir) { filterParams.sort = sortCol; filterParams.dir = sortDir; }

  const activeFilters: { label: string; value: string }[] = [];
  if (filterStage) activeFilters.push({ label: t.leads.stage, value: filterStage });
  if (sourceType) activeFilters.push({ label: t.detail.sourceType, value: t.sourceType[sourceType as keyof typeof t.sourceType] ?? sourceType });
  if (dateFrom) activeFilters.push({ label: t.filter.dateFrom, value: dateFrom });
  if (dateTo) activeFilters.push({ label: t.filter.dateTo, value: dateTo });

  const clearParams = new URLSearchParams();
  if (sortCol && sortDir) { clearParams.set("sort", sortCol); clearParams.set("dir", sortDir); }
  const clearHref = clearParams.toString() ? `/admin/leads?${clearParams.toString()}` : "/admin/leads";

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.leads }]} t={t} lang={lang} />
      <main className="flex-1 px-6 xl:px-10 py-10">
        <div className="rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
            <h1 className="font-display text-[17px] tracking-tight text-ink-800">{t.leads.title}</h1>
            <div className="flex items-center gap-2">
              <ExportButton entity="leads" format="csv" label={t.common.exportCSV} />
              <ExportButton entity="leads" format="json" label={t.common.exportJSON} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 px-5 py-2 border-b border-line bg-paper/30">
            <FilterSelect paramKey="stage" label={t.filter.allStages} value={filterStage ?? ""} searchParams={filterParams} options={LEAD_STAGES.map((s) => ({ value: s, label: s }))} />
            <FilterSelect paramKey="sourceType" label={t.filter.allSourceTypes} value={sourceType ?? ""} searchParams={filterParams} options={[{ value: "conference", label: t.sourceType.conference }, { value: "paper", label: t.sourceType.paper }, { value: "opensource", label: t.sourceType.opensource }]} />
            <FilterDateRange fromKey="dateFrom" toKey="dateTo" fromValue={dateFrom ?? ""} toValue={dateTo ?? ""} fromLabel={t.filter.dateFrom} toLabel={t.filter.dateTo} searchParams={filterParams} />
          </div>
          <FilterSummary filters={activeFilters} labels={{ activeFilters: t.filter.activeFilters, clearAll: t.filter.clearAll }} clearHref={clearHref} />
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper/30 text-left">
                <SortableHeader column="title" label={t.common.title} currentSort={sortCol} currentDir={sortDir} basePath="/admin/leads" searchParams={filterParams} />
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.leads.source}</th>
                <SortableHeader column="stage" label={t.leads.stage} currentSort={sortCol} currentDir={sortDir} basePath="/admin/leads" searchParams={filterParams} />
                <SortableHeader column="created_at" label={t.list.createdAt} currentSort={sortCol} currentDir={sortDir} basePath="/admin/leads" searchParams={filterParams} />
                <SortableHeader column="updated_at" label={t.leads.updatedAt} currentSort={sortCol} currentDir={sortDir} basePath="/admin/leads" searchParams={filterParams} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leads.length === 0 && (
                <tr><td colSpan={5}>
                  <EmptyState title={t.empty.leads} description={t.empty.leadsDesc} />
                </td></tr>
              )}
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-paper/40 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/admin/leads/${l.id}`} className="font-medium text-ink-800 hover:text-navy-600 transition-colors">
                      {l.title}
                    </Link>
                    {l.summary && (
                      <p className="text-[11px] text-ink-400 mt-0.5 truncate max-w-md">{l.summary}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-600">
                    <span className="text-[12px]">{t.sourceType[l.source_type]}</span>
                    {l.source_label && <span className="text-[11px] text-ink-400 ml-1">· {l.source_label}</span>}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill label={l.stage} />
                  </td>
                  <td className="px-5 py-3 text-ink-500 text-[12px]">{relativeTime(l.created_at, lang)}</td>
                  <td className="px-5 py-3 text-ink-500 tabular-nums text-[12px]">{l.updated_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            basePath="/admin/leads"
            searchParams={filterParams}
            labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
          />
        </div>
      </main>
    </>
  );
}
