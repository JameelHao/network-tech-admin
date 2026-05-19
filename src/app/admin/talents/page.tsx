import { Topbar } from "@/components/admin/Topbar";
import { EmptyState } from "@/components/admin/EmptyState";
import { ExportButton } from "@/components/admin/ExportButton";
import { FavoriteFilter } from "@/components/admin/FavoriteFilter";
import { Pagination } from "@/components/admin/Pagination";
import { TalentsTableWithModal } from "@/components/admin/TalentsTableWithModal";
import { listTalentLeads } from "@/lib/admin/talents";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { FilterInput, FilterSelect } from "@/components/admin/FilterControls";
import { MobileFilterPanel } from "@/components/admin/MobileFilterPanel";
import { OverflowMenu } from "@/components/admin/OverflowMenu";
import { getDict } from "@/lib/i18n/server";
import { computeTalentStats } from "@/lib/admin/talents-utils";
import { LEAD_STAGES } from "@/lib/admin/types";
import Link from "next/link";
import type { SortDir } from "@/lib/admin/pagination";
import { tabClass } from "@/lib/admin/ui";

export default async function TalentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const filterStage = typeof sp.stage === "string" ? sp.stage : undefined;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp);
  const companyFilter = typeof sp.company === "string" ? sp.company : undefined;
  const topicFilter = typeof sp.topic === "string" ? sp.topic : undefined;
  const result = await listTalentLeads(params, { stage: filterStage, company: companyFilter, topic: topicFilter });
  const talents = result.data;

  const { newCount, trackingCount, companyCount } = computeTalentStats(talents);

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
      <main className="px-6 xl:px-10 py-10">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
            {t.nav.talents}
          </p>
          <p className="mt-4 max-w-2xl text-[13.5px] text-ink-500">
            {t.talent.description}
          </p>
        </header>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">
          {t.talent.overview}
        </p>
        <section className="mb-4 rounded-lg border border-line bg-surface overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            <Stat label={t.talent.totalTalents} value={result.total} sub={t.talent.totalSub} />
            <Stat label={t.talent.newTalents} value={newCount} sub={t.talent.newSub} />
            <Stat label={t.talent.trackingTalents} value={trackingCount} sub={t.talent.trackingSub} />
            <Stat label={t.talent.companyCount} value={companyCount} sub={t.talent.companySub} />
          </div>
        </section>

        <section data-fav-filter="talents" className="rounded-lg border border-line bg-surface overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line bg-paper/30">
            <div className="hidden lg:flex flex-wrap items-center gap-1">
              {[undefined, ...LEAD_STAGES].map((s) => {
                const isActive = filterStage === s;
                const p = new URLSearchParams(filterParams);
                p.delete("stage"); p.delete("page");
                if (s) p.set("stage", s);
                const href = p.toString() ? `/admin/talents?${p.toString()}` : "/admin/talents";
                return (
                  <Link key={s ?? "all"} href={href} className={tabClass(isActive, "sm")}>
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
            <MobileFilterPanel label={t.filter.filterLabel} activeCount={activeFilters.length}>
              <div className="flex flex-wrap gap-1">
                {[undefined, ...LEAD_STAGES].map((s) => {
                  const isActive = filterStage === s;
                  const p = new URLSearchParams(filterParams);
                  p.delete("stage"); p.delete("page");
                  if (s) p.set("stage", s);
                  const href = p.toString() ? `/admin/talents?${p.toString()}` : "/admin/talents";
                  return <Link key={s ?? "all"} href={href} className={tabClass(isActive, "sm")}>{s ?? t.common.all}</Link>;
                })}
              </div>
              <FilterInput paramKey="company" value={companyFilter ?? ""} placeholder={t.filter.companyPlaceholder} searchParams={filterParams} />
              {allTopics.length > 1 && (
                <FilterSelect paramKey="topic" label={t.filter.allTopics} value={topicFilter ?? ""} searchParams={filterParams} options={allTopics.map((tp) => ({ value: tp, label: tp }))} />
              )}
            </MobileFilterPanel>
            <div className="flex items-center gap-2 shrink-0">
              <FavoriteFilter entity="talents" labels={{ favorites: t.favorite.favorites, all: t.favorite.all }} />
              <div className="hidden lg:flex items-center gap-2">
                <ExportButton entity="talents" format="csv" filters={filterParams} label={t.common.exportCSV} />
                <ExportButton entity="talents" format="json" filters={filterParams} label={t.common.exportJSON} />
              </div>
              <OverflowMenu>
                <ExportButton entity="talents" format="csv" filters={filterParams} label={t.common.exportCSV} />
                <ExportButton entity="talents" format="json" filters={filterParams} label={t.common.exportJSON} />
              </OverflowMenu>
              <Link
                href="/admin/talents/new"
                className="rounded-md bg-navy-700 px-3 py-1.5 text-[12.5px] text-navy-50 hover:bg-navy-600 transition-colors"
              >
                + {t.common.new}
              </Link>
            </div>
          </header>

          <FilterSummary filters={activeFilters} labels={{ activeFilters: t.filter.activeFilters, clearAll: t.filter.clearAll }} clearHref={clearHref} />

          <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper/30 text-left">
                <SortableHeader column="name" label={t.common.name} currentSort={sortCol} currentDir={sortDir} basePath="/admin/talents" searchParams={filterParams} />
                <th className="px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.role}</th>
                <SortableHeader column="company" label={t.common.company} currentSort={sortCol} currentDir={sortDir} basePath="/admin/talents" searchParams={filterParams} />
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.list.source}</th>
                <SortableHeader column="stage" label={t.common.stage} currentSort={sortCol} currentDir={sortDir} basePath="/admin/talents" searchParams={filterParams} />
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.topics}</th>
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.list.linkedin}</th>
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">★</th>
              </tr>
            </thead>
            {talents.length === 0 ? (
              <tbody className="divide-y divide-line">
                <tr><td colSpan={8}>
                  <EmptyState title={t.empty.talents} description={t.empty.talentsDesc} />
                </td></tr>
              </tbody>
            ) : (
              <TalentsTableWithModal talents={talents} t={t} lang={lang} />
            )}
          </table>
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            basePath="/admin/talents"
            searchParams={filterParams}
            labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
          />
        </section>
      </main>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="bg-surface p-6">
      <p className="tracked-label">{label}</p>
      <p className="mt-3 font-sans text-[30px] font-bold leading-none text-ink-900 tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-[12px] text-ink-500">{sub}</p>
    </div>
  );
}
