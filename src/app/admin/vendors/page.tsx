import { Topbar } from "@/components/admin/Topbar";
import { EmptyState } from "@/components/admin/EmptyState";
import { ExportButton } from "@/components/admin/ExportButton";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { FavoriteFilter } from "@/components/admin/FavoriteFilter";
import { Pagination } from "@/components/admin/Pagination";
import { StatusPill } from "@/components/admin/StatusPill";
import { TopicTag } from "@/components/admin/TopicTag";
import { listVendors } from "@/lib/admin/vendors";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { FilterSelect, FilterInput } from "@/components/admin/FilterControls";
import { MobileFilterPanel } from "@/components/admin/MobileFilterPanel";
import { OverflowMenu } from "@/components/admin/OverflowMenu";
import { getDict } from "@/lib/i18n/server";
import { VENDOR_TYPES, VENDOR_STAGES } from "@/lib/admin/types";
import Link from "next/link";
import type { SortDir } from "@/lib/admin/pagination";
import { tabClass } from "@/lib/admin/ui";

export default async function VendorsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp);
  const filterType = typeof sp.type === "string" ? sp.type : undefined;
  const filterStage = typeof sp.stage === "string" ? sp.stage : undefined;
  const filterTopic = typeof sp.topic === "string" ? sp.topic : undefined;
  const filterKeyword = typeof sp.keyword === "string" ? sp.keyword : undefined;
  const sortCol = typeof sp.sort === "string" ? sp.sort : undefined;
  const sortDir = typeof sp.dir === "string" ? sp.dir as SortDir : undefined;

  const result = await listVendors(params, {
    type: filterType,
    stage: filterStage,
    topic: filterTopic,
    keyword: filterKeyword,
  });
  const vendors = result.data;

  const allTopics = Array.from(new Set(vendors.flatMap((v) => v.topics))).sort();

  const filterParams: Record<string, string> = {};
  if (filterType) filterParams.type = filterType;
  if (filterStage) filterParams.stage = filterStage;
  if (filterTopic) filterParams.topic = filterTopic;
  if (filterKeyword) filterParams.keyword = filterKeyword;
  if (sortCol && sortDir) { filterParams.sort = sortCol; filterParams.dir = sortDir; }

  const activeFilters: { label: string; value: string }[] = [];
  if (filterType) activeFilters.push({ label: t.vendor.type, value: filterType });
  if (filterStage) activeFilters.push({ label: t.common.stage, value: filterStage });
  if (filterTopic) activeFilters.push({ label: t.common.topics, value: filterTopic });
  if (filterKeyword) activeFilters.push({ label: t.common.name, value: filterKeyword });

  const clearParams = new URLSearchParams();
  if (sortCol && sortDir) { clearParams.set("sort", sortCol); clearParams.set("dir", sortDir); }
  const clearHref = clearParams.toString() ? `/admin/vendors?${clearParams.toString()}` : "/admin/vendors";

  const TYPE_I18N_MAP: Record<string, string> = {
    vendor: "vendorType",
    partner: "partner",
    competitor: "competitor",
    startup: "startup",
    academic: "academic",
  };
  const typeOpts = VENDOR_TYPES.map((vt) => ({ value: vt, label: t.vendor[TYPE_I18N_MAP[vt] as keyof typeof t.vendor] as string }));

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.vendors }]} t={t} lang={lang} />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-sans text-[15px] font-semibold tracking-tight text-ink-800">{t.nav.vendors}</h1>
          <div className="flex items-center gap-2">
            <FavoriteFilter entity="vendors" labels={{ favorites: t.favorite.favorites, all: t.favorite.all }} />
            <div className="hidden lg:flex items-center gap-2">
              <ExportButton entity="vendors" format="csv" filters={filterParams} label={t.common.exportCSV} />
              <ExportButton entity="vendors" format="json" filters={filterParams} label={t.common.exportJSON} />
            </div>
            <OverflowMenu>
              <ExportButton entity="vendors" format="csv" filters={filterParams} label={t.common.exportCSV} />
              <ExportButton entity="vendors" format="json" filters={filterParams} label={t.common.exportJSON} />
            </OverflowMenu>
            <Link
              href="/admin/vendors/new"
              className="rounded-md bg-navy-700 px-3 py-1.5 text-[12.5px] text-navy-50 hover:bg-navy-600 transition-colors"
            >
              + {t.common.new}
            </Link>
          </div>
        </div>

        <div data-fav-filter="vendors" className="rounded-lg border border-line bg-surface">
          <div className="hidden lg:flex flex-wrap items-center gap-1 px-5 py-2 border-b border-line bg-paper/30">
            {[undefined, ...VENDOR_STAGES].map((s) => {
              const isActive = filterStage === s;
              const p = new URLSearchParams(filterParams);
              p.delete("stage"); p.delete("page");
              if (s) p.set("stage", s);
              const href = p.toString() ? `/admin/vendors?${p.toString()}` : "/admin/vendors";
              return (
                <Link key={s ?? "all"} href={href} className={tabClass(isActive, "sm")}>
                  {s ? (t.vendor[s as keyof typeof t.vendor] as string) : t.common.all}
                </Link>
              );
            })}
            <span className="text-ink-300 text-[10px]">|</span>
            <FilterSelect paramKey="type" label={t.vendor.allTypes} value={filterType ?? ""} searchParams={filterParams} options={typeOpts} />
            {allTopics.length > 1 && (
              <FilterSelect paramKey="topic" label={t.filter.allTopics} value={filterTopic ?? ""} searchParams={filterParams} options={allTopics.map((tp) => ({ value: tp, label: tp }))} />
            )}
          </div>
          <div className="lg:hidden px-5 py-2 border-b border-line bg-paper/30">
            <MobileFilterPanel label={t.filter.filterLabel} activeCount={activeFilters.length}>
              <div className="flex flex-wrap gap-1">
                {[undefined, ...VENDOR_STAGES].map((s) => {
                  const isActive = filterStage === s;
                  const p = new URLSearchParams(filterParams);
                  p.delete("stage"); p.delete("page");
                  if (s) p.set("stage", s);
                  const href = p.toString() ? `/admin/vendors?${p.toString()}` : "/admin/vendors";
                  return <Link key={s ?? "all"} href={href} className={tabClass(isActive, "sm")}>{s ? (t.vendor[s as keyof typeof t.vendor] as string) : t.common.all}</Link>;
                })}
              </div>
              <FilterSelect paramKey="type" label={t.vendor.allTypes} value={filterType ?? ""} searchParams={filterParams} options={typeOpts} />
              {allTopics.length > 1 && (
                <FilterSelect paramKey="topic" label={t.filter.allTopics} value={filterTopic ?? ""} searchParams={filterParams} options={allTopics.map((tp) => ({ value: tp, label: tp }))} />
              )}
            </MobileFilterPanel>
          </div>
          <FilterSummary filters={activeFilters} labels={{ activeFilters: t.filter.activeFilters, clearAll: t.filter.clearAll }} clearHref={clearHref} />

          <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper/30 text-left">
                <SortableHeader column="name" label={t.common.name} currentSort={sortCol} currentDir={sortDir} basePath="/admin/vendors" searchParams={filterParams} />
                <SortableHeader column="type" label={t.vendor.type} currentSort={sortCol} currentDir={sortDir} basePath="/admin/vendors" searchParams={filterParams} />
                <SortableHeader column="stage" label={t.common.stage} currentSort={sortCol} currentDir={sortDir} basePath="/admin/vendors" searchParams={filterParams} />
                <SortableHeader column="founded_year" label={t.vendor.foundedYear} currentSort={sortCol} currentDir={sortDir} basePath="/admin/vendors" searchParams={filterParams} className="hidden lg:table-cell" />
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.vendor.hqLocation}</th>
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.topics}</th>
                <th className="hidden lg:table-cell px-3 sm:px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">★</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {vendors.length === 0 ? (
                <tr><td colSpan={7}>
                  <EmptyState title={t.empty.vendors} description={t.empty.vendorsDesc} />
                </td></tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-3 sm:px-5 py-3">
                      <Link href={`/admin/vendors/${v.id}`} className="font-medium text-ink-800 hover:text-navy-600 transition-colors">
                        {v.name}
                      </Link>
                      {v.description && (
                        <p className="text-[11px] text-ink-400 mt-0.5 truncate max-w-[150px] sm:max-w-xs">{v.description}</p>
                      )}
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-ink-600 whitespace-nowrap">{t.vendor[TYPE_I18N_MAP[v.type] as keyof typeof t.vendor] as string}</td>
                    <td className="px-3 sm:px-5 py-3 whitespace-nowrap">
                      <StatusPill label={v.stage} lang={lang} />
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-5 py-3 text-ink-600 tabular-nums">{v.founded_year ?? "—"}</td>
                    <td className="hidden lg:table-cell px-3 sm:px-5 py-3 text-ink-600">{v.hq_location ?? "—"}</td>
                    <td className="hidden lg:table-cell px-3 sm:px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {v.topics.length > 0
                          ? v.topics.slice(0, 3).map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)
                          : <span className="text-[11px] text-ink-400">—</span>
                        }
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-5 py-3"><FavoriteButton entity="vendors" id={v.id} label={v.name} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            basePath="/admin/vendors"
            searchParams={filterParams}
            labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
          />
        </div>
      </main>
    </>
  );
}
