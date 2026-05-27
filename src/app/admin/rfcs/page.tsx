import { Topbar } from "@/components/admin/Topbar";
import { SyncStatusBar } from "@/components/admin/SyncStatusBar";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { ExportButton } from "@/components/admin/ExportButton";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { FilterInput } from "@/components/admin/FilterControls";
import { MobileFilterPanel } from "@/components/admin/MobileFilterPanel";
import { OverflowMenu } from "@/components/admin/OverflowMenu";
import { RfcsTableWithModal } from "@/components/admin/RfcsTableWithModal";
import { listRfcs } from "@/lib/admin/rfcs";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { getDict } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import type { SortDir } from "@/lib/admin/pagination";

export default async function RfcsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp, { pageSize: 25 });

  const keyword = typeof sp.q === "string" ? sp.q : undefined;
  const company = typeof sp.company === "string" ? sp.company : undefined;

  const result = await listRfcs(params, { keyword, company });
  const items = result.data;

  const supabase = await createClient();
  const { data: companyRows } = await supabase
    .from("rfcs")
    .select("companies");
  const allCompanies = [...new Set(companyRows?.flatMap((r) => r.companies ?? []) ?? [])].sort() as string[];

  const sortCol = typeof sp.sort === "string" ? sp.sort : undefined;
  const sortDir = typeof sp.dir === "string" ? sp.dir as SortDir : undefined;

  const filterParams: Record<string, string> = {};
  if (keyword) filterParams.q = keyword;
  if (company) filterParams.company = company;
  if (sortCol && sortDir) { filterParams.sort = sortCol; filterParams.dir = sortDir; }

  const activeFilters: { label: string; value: string }[] = [];
  if (keyword) activeFilters.push({ label: t.common.name, value: keyword });
  if (company) activeFilters.push({ label: t.detail.company, value: company });

  const clearParams = new URLSearchParams();
  if (sortCol && sortDir) { clearParams.set("sort", sortCol); clearParams.set("dir", sortDir); }
  const clearHref = clearParams.toString() ? `/admin/rfcs?${clearParams.toString()}` : "/admin/rfcs";

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.rfcs }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
            {t.nav.rfcs}
          </p>
          <p className="mt-4 max-w-2xl text-[13.5px] text-ink-500">
            {t.rfcs.description}
          </p>
        </header>

        <SyncStatusBar entity="rfcs" lang={lang} labels={{ lastSync: t.sync.lastSync, refresh: t.sync.refresh, refreshing: t.sync.refreshing, noData: t.sync.noData, syncResult: t.sync.syncResult, sourcesFailed: t.sync.sourcesFailed }} />

        <section className="rounded-lg border border-line bg-surface overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line bg-paper/30">
            <div className="flex items-center gap-2">
              <FilterInput
                paramKey="q"
                value={keyword ?? ""}
                placeholder={lang === "zh" ? "搜索 RFC..." : "Search RFCs..."}
                searchParams={filterParams}
              />
              {allCompanies.length > 0 && (
                <div className="hidden lg:flex flex-wrap gap-2 ml-2">
                  {allCompanies.map((c) => {
                    const p = new URLSearchParams(filterParams);
                    p.delete("page");
                    if (p.get("company") === c) p.delete("company");
                    else p.set("company", c);
                    const href = p.toString() ? `/admin/rfcs?${p.toString()}` : "/admin/rfcs";
                    const active = company === c;
                    return (
                      <a key={c} href={href} className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${active ? "bg-navy-50 border-navy-300 text-navy-600" : "border-line text-ink-500 hover:bg-paper/40"}`}>
                        {c}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ExportButton entity="rfcs" format="csv" label={t.common.exportCSV} />
              <ExportButton entity="rfcs" format="json" label={t.common.exportJSON} />
            </div>
          </header>

          <FilterSummary filters={activeFilters} labels={{ activeFilters: t.filter.activeFilters, clearAll: t.filter.clearAll }} clearHref={clearHref} />

          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-line bg-paper/30">
                  <SortableHeader column="rfc_number" label="#" currentSort={sortCol} currentDir={sortDir} basePath="/admin/rfcs" searchParams={filterParams} />
                  <SortableHeader column="title" label={t.common.title} currentSort={sortCol} currentDir={sortDir} basePath="/admin/rfcs" searchParams={filterParams} />
                  <th className="px-3 sm:px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 text-left">{t.common.topics}</th>
                  <SortableHeader column="published_at" label={t.list.publishedAt} currentSort={sortCol} currentDir={sortDir} basePath="/admin/rfcs" searchParams={filterParams} />
                </tr>
              </thead>
              {items.length === 0 ? (
                <tbody>
                  <tr><td colSpan={4}>
                    <EmptyState title={t.rfcs.noMatch} description={t.empty.rfcsDesc} compact />
                  </td></tr>
                </tbody>
              ) : (
                <RfcsTableWithModal items={items} t={t} lang={lang} />
              )}
            </table>
          </div>

          {result.totalPages > 1 && (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
              pageSize={result.pageSize}
              basePath="/admin/rfcs"
              searchParams={filterParams}
              labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
            />
          )}
        </section>
      </main>
    </>
  );
}
