import { Topbar } from "@/components/admin/Topbar";
import { SyncStatusBar } from "@/components/admin/SyncStatusBar";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { NewBadge } from "@/components/admin/NewBadge";
import { ExportButton } from "@/components/admin/ExportButton";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { FavoriteFilter } from "@/components/admin/FavoriteFilter";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { FilterDateRange, FilterSelect, FilterInput } from "@/components/admin/FilterControls";
import { MobileFilterPanel } from "@/components/admin/MobileFilterPanel";
import { OverflowMenu } from "@/components/admin/OverflowMenu";
import { listJobs } from "@/lib/admin/jobs";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { relativeTime, isExpired } from "@/lib/admin/format";
import { getDict } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { tabClass } from "@/lib/admin/ui";
import Link from "next/link";
import type { SortDir } from "@/lib/admin/pagination";

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
}

const DAY_MS = 86_400_000;

function isNew48h(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 2 * DAY_MS;
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp, { pageSize: 25 });

  const keyword = typeof sp.q === "string" ? sp.q : undefined;
  const source = typeof sp.source === "string" ? sp.source : undefined;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const dateFrom = typeof sp.dateFrom === "string" ? sp.dateFrom : undefined;
  const dateTo = typeof sp.dateTo === "string" ? sp.dateTo : undefined;

  const result = await listJobs(params, { keyword, source, status, dateFrom, dateTo });
  const items = result.data;

  const supabase = await createClient();
  const { data: sourceRows } = await supabase
    .from("news_items")
    .select("source")
    .eq("category", "job")
    .not("source", "is", null);
  const sources = Array.from(new Set((sourceRows ?? []).map((r) => r.source as string).filter(Boolean))).sort();

  const sortCol = typeof sp.sort === "string" ? sp.sort : undefined;
  const sortDir = typeof sp.dir === "string" ? sp.dir as SortDir : undefined;

  const filterParams: Record<string, string> = {};
  if (keyword) filterParams.q = keyword;
  if (source) filterParams.source = source;
  if (status) filterParams.status = status;
  if (dateFrom) filterParams.dateFrom = dateFrom;
  if (dateTo) filterParams.dateTo = dateTo;
  if (sortCol && sortDir) { filterParams.sort = sortCol; filterParams.dir = sortDir; }

  const activeFilters: { label: string; value: string }[] = [];
  if (keyword) activeFilters.push({ label: t.jobs.searchPlaceholder, value: keyword });
  if (source) activeFilters.push({ label: t.jobs.allSources, value: source });
  if (status) activeFilters.push({ label: t.jobs.status, value: status === "active" ? t.jobs.active : t.list.expired });
  if (dateFrom) activeFilters.push({ label: t.filter.dateFrom, value: dateFrom });
  if (dateTo) activeFilters.push({ label: t.filter.dateTo, value: dateTo });

  const clearParams = new URLSearchParams();
  if (sortCol && sortDir) { clearParams.set("sort", sortCol); clearParams.set("dir", sortDir); }
  const clearHref = clearParams.toString() ? `/admin/jobs?${clearParams.toString()}` : "/admin/jobs";

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.jobs }]} t={t} lang={lang} />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10">
        <SyncStatusBar entity="jobs" lang={lang} labels={{ lastSync: t.sync.lastSync, refresh: t.sync.refresh, refreshing: t.sync.refreshing, noData: t.sync.noData }} />

        <section data-fav-filter="jobs" className="rounded-lg border border-line bg-surface overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line bg-paper/30">
            <h1 className="font-display text-[17px] tracking-tight text-ink-800 shrink-0">
              {t.jobs.title}
              <span className="ml-2 font-mono text-[11px] tabular-nums text-ink-400">{result.total}</span>
            </h1>
            <div className="hidden lg:flex flex-wrap items-center gap-2">
              <FilterInput
                paramKey="q"
                value={keyword ?? ""}
                placeholder={t.jobs.searchPlaceholder}
                searchParams={filterParams}
              />
              {sources.length > 1 && (
                <FilterSelect
                  paramKey="source"
                  label={t.jobs.allSources}
                  options={sources.map((s) => ({ value: s, label: s }))}
                  value={source ?? ""}
                  searchParams={filterParams}
                />
              )}
              <span className="text-ink-300 text-[10px]">|</span>
              {(["", "active", "expired"] as const).map((s) => {
                const isActive = (status ?? "") === s;
                const label = s === "" ? t.jobs.allStatuses : s === "active" ? t.jobs.active : t.list.expired;
                const p = new URLSearchParams(filterParams);
                p.delete("status"); p.delete("page");
                if (s) p.set("status", s);
                const href = p.toString() ? `/admin/jobs?${p.toString()}` : "/admin/jobs";
                return (
                  <Link key={s} href={href} className={tabClass(isActive, "sm")}>
                    {label}
                  </Link>
                );
              })}
              <FilterDateRange
                fromKey="dateFrom" toKey="dateTo"
                fromValue={dateFrom ?? ""} toValue={dateTo ?? ""}
                fromLabel={t.filter.dateFrom} toLabel={t.filter.dateTo}
                searchParams={filterParams}
              />
            </div>
            <MobileFilterPanel label={t.filter.filterLabel} activeCount={activeFilters.length}>
              <FilterInput
                paramKey="q"
                value={keyword ?? ""}
                placeholder={t.jobs.searchPlaceholder}
                searchParams={filterParams}
              />
              {sources.length > 1 && (
                <FilterSelect
                  paramKey="source"
                  label={t.jobs.allSources}
                  options={sources.map((s) => ({ value: s, label: s }))}
                  value={source ?? ""}
                  searchParams={filterParams}
                />
              )}
              <div className="flex flex-wrap gap-1">
                {(["", "active", "expired"] as const).map((s) => {
                  const isActive = (status ?? "") === s;
                  const label = s === "" ? t.jobs.allStatuses : s === "active" ? t.jobs.active : t.list.expired;
                  const p = new URLSearchParams(filterParams);
                  p.delete("status"); p.delete("page");
                  if (s) p.set("status", s);
                  const href = p.toString() ? `/admin/jobs?${p.toString()}` : "/admin/jobs";
                  return <Link key={s} href={href} className={tabClass(isActive, "sm")}>{label}</Link>;
                })}
              </div>
              <FilterDateRange
                fromKey="dateFrom" toKey="dateTo"
                fromValue={dateFrom ?? ""} toValue={dateTo ?? ""}
                fromLabel={t.filter.dateFrom} toLabel={t.filter.dateTo}
                searchParams={filterParams}
              />
            </MobileFilterPanel>
            <div className="flex items-center gap-2 shrink-0">
              <FavoriteFilter entity="jobs" labels={{ favorites: t.favorite.favorites, all: t.favorite.all }} />
              <div className="hidden lg:flex items-center gap-2">
                <ExportButton entity="jobs" format="csv" label={t.common.exportCSV} />
                <ExportButton entity="jobs" format="json" label={t.common.exportJSON} />
              </div>
              <OverflowMenu>
                <ExportButton entity="jobs" format="csv" label={t.common.exportCSV} />
                <ExportButton entity="jobs" format="json" label={t.common.exportJSON} />
              </OverflowMenu>
            </div>
          </header>

          <FilterSummary filters={activeFilters} labels={{ activeFilters: t.filter.activeFilters, clearAll: t.filter.clearAll }} clearHref={clearHref} />

          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-line bg-paper/30">
                  <SortableHeader column="title" label={t.common.title} currentSort={sortCol} currentDir={sortDir} basePath="/admin/jobs" searchParams={filterParams} />
                  <SortableHeader column="source" label={t.jobs.company} currentSort={sortCol} currentDir={sortDir} basePath="/admin/jobs" searchParams={filterParams} />
                  <Th className="hidden lg:table-cell">{t.jobs.location}</Th>
                  <Th className="hidden lg:table-cell">{t.list.source}</Th>
                  <Th className="hidden lg:table-cell">{t.detail.topics}</Th>
                  <SortableHeader column="pub_date" label={t.list.publishedAt} currentSort={sortCol} currentDir={sortDir} basePath="/admin/jobs" searchParams={filterParams} />
                  <Th>{t.jobs.status}</Th>
                  <Th className="hidden lg:table-cell">{t.jobs.freshness}</Th>
                  <Th>★</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const stale = isExpired(item.pub_date, 30);
                  const fresh = isNew48h(item.pub_date);
                  return (
                    <tr key={item.id} data-fav={true} className={`group border-b border-line last:border-b-0 hover:bg-paper/40 transition-colors ${stale ? "opacity-50" : ""}`}>
                      <Td>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-[13px] font-medium line-clamp-2 max-w-[300px] block hover:text-navy-700 ${stale ? "text-ink-500" : "text-ink-800"}`}
                        >
                          {item.title}
                        </a>
                      </Td>
                      <Td>
                        {item.source ? (
                          <span className="text-[12px] text-ink-700">{item.source}</span>
                        ) : <span className="text-ink-400">—</span>}
                      </Td>
                      <Td className="hidden lg:table-cell">
                        <span className="text-[12px] text-ink-400">—</span>
                      </Td>
                      <Td className="hidden lg:table-cell">
                        <span className="font-mono text-[11px] text-ink-500">{extractDomain(item.link)}</span>
                      </Td>
                      <Td className="hidden lg:table-cell">
                        <span className="text-[12px] text-ink-400">—</span>
                      </Td>
                      <Td>
                        {item.pub_date ? (
                          <span className="font-mono text-[11.5px] tabular-nums text-ink-700" title={item.pub_date}>
                            {relativeTime(item.pub_date, lang)}
                          </span>
                        ) : <span className="text-ink-400">—</span>}
                      </Td>
                      <Td>
                        {stale ? (
                          <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 font-mono text-[9px] text-red-600 uppercase tracking-[0.1em]">
                            {t.list.expired}
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[9px] text-emerald-700 uppercase tracking-[0.1em]">
                            {t.jobs.active}
                          </span>
                        )}
                      </Td>
                      <Td className="hidden lg:table-cell">
                        {fresh ? <NewBadge label={t.time.new} /> : null}
                      </Td>
                      <Td><FavoriteButton entity="jobs" id={item.id} label={item.title} /></Td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr><td colSpan={9}>
                    <EmptyState title={t.jobs.noMatch} description={t.empty.jobsDesc} compact />
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {result.totalPages > 1 && (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
              pageSize={result.pageSize}
              basePath="/admin/jobs"
              searchParams={filterParams}
              labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
            />
          )}
        </section>
      </main>
    </>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 text-left ${className ?? ""}`}>{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className ?? ""}`}>{children}</td>;
}
