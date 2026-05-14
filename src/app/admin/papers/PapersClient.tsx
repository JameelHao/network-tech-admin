"use client";

import { useState, useMemo, useEffect } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { NewBadge } from "@/components/admin/NewBadge";
import { TimeRangeBar } from "@/components/admin/TimeRangeBar";
import { ExportButton } from "@/components/admin/ExportButton";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { FavoriteFilter } from "@/components/admin/FavoriteFilter";
import { MobileFilterPanel } from "@/components/admin/MobileFilterPanel";
import { OverflowMenu } from "@/components/admin/OverflowMenu";
import { DuplicateWarning } from "@/components/admin/DuplicateWarning";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { PaginationClient } from "@/components/admin/PaginationClient";
import { TopicTag } from "@/components/admin/TopicTag";
import { clusterByTopics } from "@/lib/admin/paper-utils";
import { relativeTime, isCurrentYear, isNew, isExpired } from "@/lib/admin/format";
import { SortableHeaderClient } from "@/components/admin/SortableHeader";
import { useFilterParams } from "@/hooks/useFilterParams";
import { useFavorites } from "@/hooks/useFavorites";
import { useSortable } from "@/hooks/useSortable";
import type { Paper } from "@/lib/admin/types";
import type { DuplicateGroup } from "@/lib/admin/paper-dedup";
import type { Lang } from "@/lib/i18n/dict";
import { tabClass, tabGroupClass, badgeClass } from "@/lib/admin/ui";
import type { SortDir } from "@/lib/admin/pagination";

type PapersLabels = {
  title: string;
  searchPlaceholder: string;
  allSources: string;
  allCategories: string;
  noMatch: string;
  emptyDesc: string;
  exportCSV: string;
  exportJSON: string;
  viewList: string;
  viewCluster: string;
  papersCount: string;
  dateRange: string;
  filter: string;
  publishedAt: string;
  sortLabel: string;
  titleLabel: string;
  activeFilters: string;
  clearAll: string;
  dateFrom: string;
  dateTo: string;
  timeRange: { today: string; week: string; month: string; all: string };
  newLabel: string;
  favorites: string;
  favoritesAll: string;
  authors: string;
  venue: string;
  topics: string;
  citations: string;
  source: string;
  rows: string;
  page: string;
  dedup: {
    warning: string;
    groupsFound: string;
    viewDetails: string;
    hide: string;
    similarity: string;
    exactTitle: string;
    similarTitle: string;
    sameAuthorsSimilarTitle: string;
    ignore: string;
    reset: string;
  };
};

const PAGE_SIZE = 25;

export function PapersClient({ papers, duplicateGroups, labels, lang }: { papers: Paper[]; duplicateGroups?: DuplicateGroup[]; labels: PapersLabels; lang: Lang }) {
  const fp = useFilterParams();
  const keyword = fp.get("keyword");
  const venue = fp.get("venue");
  const topic = fp.get("topic");
  const sourceFilter = fp.get("source");
  const dateFrom = fp.get("dateFrom");
  const dateTo = fp.get("dateTo");
  const timeRange = fp.get("timeRange");
  const [viewMode, setViewMode] = useState<"list" | "cluster">("list");
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);
  const [page, setPage] = useState(1);
  const { favIds } = useFavorites("papers");

  const venues = useMemo(() => {
    const set = new Set<string>();
    for (const p of papers) {
      if (p.venue) set.add(p.venue);
    }
    return Array.from(set).sort();
  }, [papers]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const p of papers) {
      for (const t of p.topics) set.add(t);
    }
    return Array.from(set).sort();
  }, [papers]);

  const sources = useMemo(() => {
    const set = new Set<string>();
    for (const p of papers) {
      if (p.source) set.add(p.source);
    }
    return Array.from(set).sort();
  }, [papers]);

  const filtered = useMemo(() => {
    let list = papers;
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          p.authors.some((a) => a.toLowerCase().includes(kw)) ||
          (p.abstract && p.abstract.toLowerCase().includes(kw))
      );
    }
    if (venue) {
      list = list.filter((p) => p.venue === venue);
    }
    if (topic) {
      list = list.filter((p) => p.topics.includes(topic));
    }
    if (sourceFilter) {
      list = list.filter((p) => p.source === sourceFilter);
    }
    if (dateFrom) {
      list = list.filter((p) => p.published_date && p.published_date >= dateFrom);
    }
    if (dateTo) {
      list = list.filter((p) => p.published_date && p.published_date <= dateTo);
    }
    if (timeRange) {
      const DAY = 86_400_000;
      const ms: Record<string, number> = { today: DAY, week: 7 * DAY, month: 30 * DAY };
      const threshold = ms[timeRange];
      if (threshold) {
        const now = Date.now();
        list = list.filter((p) => p.published_date && now - new Date(p.published_date).getTime() < threshold);
      }
    }
    if (showOnlyFavs) {
      list = list.filter((p) => favIds.has(p.id));
    }
    return list;
  }, [papers, keyword, venue, topic, sourceFilter, dateFrom, dateTo, timeRange, showOnlyFavs, favIds]);

  const { sorted, sortKey, sortDir, onSort } = useSortable<Paper>(filtered, { key: "published_date", dir: "desc" });

  const clusters = useMemo(() => clusterByTopics(sorted), [sorted]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [sorted.length]);

  const paginated = useMemo(() => {
    const from = (page - 1) * PAGE_SIZE;
    return sorted.slice(from, from + PAGE_SIZE);
  }, [sorted, page]);

  return (
    <div className="rounded-lg border border-line bg-surface overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line bg-paper/30">
        <div className="hidden lg:flex items-center gap-2">
          <FavoriteFilter entity="papers" labels={{ favorites: labels.favorites, all: labels.favoritesAll }} onToggle={setShowOnlyFavs} />
          <TimeRangeBar value={timeRange} onChange={(v) => fp.set("timeRange", v)} labels={labels.timeRange} />
          <div className={tabGroupClass()}>
            <button
              onClick={() => setViewMode("list")}
              className={tabClass(viewMode === "list", "sm")}
            >
              {labels.viewList}
            </button>
            <button
              onClick={() => setViewMode("cluster")}
              className={tabClass(viewMode === "cluster", "sm")}
            >
              {labels.viewCluster}
            </button>
          </div>
        </div>
        <MobileFilterPanel label={labels.filter} activeCount={[keyword, venue, topic, sourceFilter, dateFrom, dateTo].filter(Boolean).length}>
          <input
            type="text"
            key={keyword}
            defaultValue={keyword}
            placeholder={labels.searchPlaceholder}
            onBlur={(e) => { const v = e.target.value.trim(); if (v !== keyword) fp.set("keyword", v); }}
            onKeyDown={(e) => { if (e.key === "Enter") { const v = e.currentTarget.value.trim(); if (v !== keyword) fp.set("keyword", v); } }}
            className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full"
          />
          {venues.length > 1 && (
            <select
              value={venue}
              onChange={(e) => fp.set("venue", e.target.value)}
              className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full"
            >
              <option value="">{labels.allSources}</option>
              {venues.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          )}
          {topics.length > 1 && (
            <select
              value={topic}
              onChange={(e) => fp.set("topic", e.target.value)}
              className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full"
            >
              <option value="">{labels.allCategories}</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
          {sources.length > 1 && (
            <select
              value={sourceFilter}
              onChange={(e) => fp.set("source", e.target.value)}
              className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full"
            >
              <option value="">{labels.source}</option>
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => fp.set("dateFrom", e.target.value)}
              aria-label={labels.dateFrom}
              className="rounded-md border border-line bg-surface px-2 py-1 min-h-[36px] text-[12px] text-ink-700 w-full sm:w-[130px]"
            />
            <span className="text-ink-400 text-[10px]">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => fp.set("dateTo", e.target.value)}
              aria-label={labels.dateTo}
              className="rounded-md border border-line bg-surface px-2 py-1 min-h-[36px] text-[12px] text-ink-700 w-full sm:w-[130px]"
            />
          </div>
        </MobileFilterPanel>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-2">
            <ExportButton entity="papers" format="csv" label={labels.exportCSV} />
            <ExportButton entity="papers" format="json" label={labels.exportJSON} />
          </div>
          <OverflowMenu>
            <ExportButton entity="papers" format="csv" label={labels.exportCSV} />
            <ExportButton entity="papers" format="json" label={labels.exportJSON} />
          </OverflowMenu>
        </div>
      </header>

      <FilterSummary
          filters={[
            ...(keyword ? [{ label: labels.searchPlaceholder, value: keyword }] : []),
            ...(venue ? [{ label: labels.allSources, value: venue }] : []),
            ...(topic ? [{ label: labels.allCategories, value: topic }] : []),
            ...(sourceFilter ? [{ label: labels.source, value: sourceFilter }] : []),
            ...(dateFrom ? [{ label: labels.dateFrom, value: dateFrom }] : []),
            ...(dateTo ? [{ label: labels.dateTo, value: dateTo }] : []),
          ]}
          labels={{ activeFilters: labels.activeFilters, clearAll: labels.clearAll }}
          onClear={fp.clearAll}
        />

        {duplicateGroups && duplicateGroups.length > 0 && (
          <DuplicateWarning groups={duplicateGroups} labels={labels.dedup} />
        )}

        {sorted.length === 0 ? (
          <EmptyState title={labels.noMatch} description={labels.emptyDesc} compact />
        ) : viewMode === "list" ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-paper/30">
                    <Th>
                      <SortableHeaderClient column="title" label={labels.titleLabel} currentSort={sortKey ?? undefined} currentDir={sortDir as SortDir | undefined} onSort={onSort} />
                    </Th>
                    <Th>{labels.authors}</Th>
                    <Th>
                      <SortableHeaderClient column="venue" label={labels.venue} currentSort={sortKey ?? undefined} currentDir={sortDir as SortDir | undefined} onSort={onSort} />
                    </Th>
                    <Th className="hidden lg:table-cell">
                      <SortableHeaderClient column="citation_count" label={labels.citations} currentSort={sortKey ?? undefined} currentDir={sortDir as SortDir | undefined} onSort={onSort} />
                    </Th>
                    <Th className="hidden lg:table-cell">{labels.topics}</Th>
                    <Th>
                      <SortableHeaderClient column="published_date" label={labels.publishedAt} currentSort={sortKey ?? undefined} currentDir={sortDir as SortDir | undefined} onSort={onSort} />
                    </Th>
                    <Th className="hidden lg:table-cell">★</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {paginated.length === 0 && (
                    <tr><td colSpan={7}>
                      <EmptyState title={labels.noMatch} description={labels.emptyDesc} compact />
                    </td></tr>
                  )}
                  {paginated.map((p) => {
                    const stale = isExpired(p.published_date, 30);
                    return (
                      <tr key={p.id} className={`group border-b border-line last:border-b-0 hover:bg-paper/40 transition-colors ${stale ? "opacity-50" : ""}`}>
                        <Td>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={p.url || `https://scholar.google.com/scholar?q=${encodeURIComponent(p.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-[13px] font-normal line-clamp-2 max-w-full sm:max-w-[300px] block hover:text-navy-700 ${stale ? "text-ink-500" : "text-ink-800"}`}
                            >
                              {p.title}
                            </a>
                            {isNew(p.published_date) && <NewBadge label={labels.newLabel} />}
                          </div>
                        </Td>
                        <Td>
                          <span className="text-[12px] text-ink-600">
                            {p.authors.slice(0, 2).join(", ")}
                            {p.authors.length > 2 && <span className="text-ink-400"> +{p.authors.length - 2}</span>}
                          </span>
                        </Td>
                        <Td>
                          {p.venue ? (
                            <span className="rounded-full bg-navy-50 border border-navy-200 px-2 py-0.5 font-mono text-[10px] text-navy-700">{p.venue}</span>
                          ) : <span className="text-ink-400">—</span>}
                        </Td>
                        <Td className="hidden lg:table-cell">
                          {p.citation_count != null ? (
                            <span className="font-mono text-[11.5px] tabular-nums text-ink-600">{p.citation_count.toLocaleString()}</span>
                          ) : <span className="text-ink-300">—</span>}
                        </Td>
                        <Td className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {p.topics.slice(0, 3).map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}
                            {p.topics.length > 3 && <span className="text-[10px] text-ink-400">+{p.topics.length - 3}</span>}
                          </div>
                        </Td>
                        <Td className="whitespace-nowrap">
                          {p.published_date ? (
                            <span className="font-mono text-[11.5px] tabular-nums text-ink-700" title={p.published_date}>
                              {relativeTime(p.published_date, lang)}
                            </span>
                          ) : <span className="text-ink-400">—</span>}
                        </Td>
                        <Td className="hidden lg:table-cell">
                          <FavoriteButton entity="papers" id={p.id} label={p.title} />
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationClient
              page={page}
              totalPages={totalPages}
              total={sorted.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              labels={{ rows: labels.rows, page: labels.page }}
            />
          </>
        ) : (
          <div className="divide-y divide-line">
            {clusters.map((cluster) => (
              <details key={cluster.topic} className="group">
                <summary className="flex items-center gap-3 px-5 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-paper/40 transition-colors select-none">
                  <svg
                    viewBox="0 0 12 12"
                    className="h-3 w-3 shrink-0 text-ink-400 transition-transform group-open:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  >
                    <path d="M4.5 3 L7.5 6 L4.5 9" />
                  </svg>
                  <span className="font-mono text-[12px] font-semibold text-ink-700">{cluster.topic}</span>
                  <span className={badgeClass()}>
                    {cluster.count} {labels.papersCount}
                  </span>
                  <span className="font-mono text-[10px] text-ink-400 ml-auto">
                    {labels.dateRange}: {cluster.dateRange}
                  </span>
                </summary>
                <div className="divide-y divide-line border-t border-line">
                  {cluster.papers.map((p) => (
                    <PaperRow key={p.id} paper={p} lang={lang} publishedLabel={labels.publishedAt} newLabel={labels.newLabel} />
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
    </div>
  );
}

function PaperRow({ paper: p, lang, publishedLabel, newLabel }: { paper: Paper; lang: Lang; publishedLabel: string; newLabel: string }) {
  const yearBadge = p.published_date && !isCurrentYear(p.published_date)
    ? new Date(p.published_date).getFullYear().toString()
    : null;
  const stale = isExpired(p.published_date, 30);

  return (
    <a
      href={p.url || `https://scholar.google.com/scholar?q=${encodeURIComponent(p.title)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`block px-3 sm:px-5 py-4 hover:bg-paper/40 transition-colors ${stale ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-2">
        <p className={`text-[13px] font-normal flex-1 ${stale ? "text-ink-500" : "text-ink-800"}`}>{p.title}</p>
        <FavoriteButton entity="papers" id={p.id} label={p.title} />
        {isNew(p.published_date) && <NewBadge label={newLabel} />}
        {yearBadge && (
          <span className="shrink-0 rounded-full bg-ink-100 px-1.5 py-0.5 font-mono text-[9px] text-ink-500">{yearBadge}</span>
        )}
      </div>
      <p className="text-[12px] text-ink-500 mt-1">
        {p.authors.slice(0, 5).join(", ")}{p.authors.length > 5 ? ` +${p.authors.length - 5}` : ""}
        {p.venue && <> · <span className="text-navy-500">{p.venue}</span></>}
        {p.published_date && <> · <span className="text-ink-400">{relativeTime(p.published_date, lang)}</span></>}
      </p>
      {p.abstract && (
        <p className="text-[12px] text-ink-400 mt-1.5 line-clamp-2">{p.abstract}</p>
      )}
    </a>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 sm:px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 text-left ${className ?? ""}`}>{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 sm:px-4 py-3 align-middle ${className ?? ""}`}>{children}</td>;
}
