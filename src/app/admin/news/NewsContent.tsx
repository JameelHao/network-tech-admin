"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { NewBadge } from "@/components/admin/NewBadge";
import { TimeGroupHeader } from "@/components/admin/TimeGroupHeader";
import { TimeRangeBar } from "@/components/admin/TimeRangeBar";
import { ExportButton } from "@/components/admin/ExportButton";
import { MobileFilterBar } from "@/components/admin/MobileFilterBar";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { PaginationClient } from "@/components/admin/PaginationClient";
import { SortableHeaderClient } from "@/components/admin/SortableHeader";
import { relativeTime, getTimeGroup, isNew, isExpired } from "@/lib/admin/format";
import type { TimeGroup } from "@/lib/admin/format";
import { useFilterParams } from "@/hooks/useFilterParams";
import { useSortable } from "@/hooks/useSortable";
import type { Lang } from "@/lib/i18n/dict";
import type { SortDir } from "@/lib/admin/pagination";

type NewsItem = { title: string; link: string; snippet: string; source?: string; pubDate?: string };

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
}

function Skeleton() {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-5 py-4 animate-pulse">
          <div className="h-4 bg-ink-100 rounded w-3/4" />
          <div className="h-3 bg-ink-100 rounded w-full mt-2" />
          <div className="h-3 bg-ink-100 rounded w-1/4 mt-2" />
        </div>
      ))}
    </div>
  );
}

type NewsLabels = {
  title: string;
  searchPlaceholder: string;
  allSources: string;
  noMatch: string;
  emptyDesc: string;
  errorMessage: string;
  retryLabel: string;
  rows: string;
  page: string;
  exportCSV: string;
  exportJSON: string;
  filter: string;
  sortLabel: string;
  titleLabel: string;
  sourceLabel: string;
  pubDateLabel: string;
  activeFilters: string;
  clearAll: string;
  dateFrom: string;
  dateTo: string;
  timeRange: { today: string; week: string; month: string; all: string };
  timeGroup: Record<TimeGroup, string>;
  newLabel: string;
};

export function NewsContent({ labels, lang }: { labels: NewsLabels; lang: Lang }) {
  const fp = useFilterParams();
  const keyword = fp.get("keyword");
  const source = fp.get("source");
  const dateFrom = fp.get("dateFrom");
  const dateTo = fp.get("dateTo");
  const timeRange = fp.get("timeRange");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 25;

  const fetchPage = useCallback((p: number) => {
    setLoading(true);
    fetch(`/api/news?page=${p}&size=${pageSize}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => setError("Failed to fetch news"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPage(1); }, [fetchPage]);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    fetchPage(p);
  }, [fetchPage]);

  const sources = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.source) set.add(item.source);
    }
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter((item) =>
        item.title.toLowerCase().includes(kw) || item.snippet.toLowerCase().includes(kw)
      );
    }
    if (source) {
      list = list.filter((item) => item.source === source);
    }
    if (dateFrom) {
      list = list.filter((item) => item.pubDate && item.pubDate >= dateFrom);
    }
    if (dateTo) {
      list = list.filter((item) => item.pubDate && item.pubDate <= dateTo);
    }
    if (timeRange) {
      const DAY = 86_400_000;
      const ms: Record<string, number> = { today: DAY, week: 7 * DAY, month: 30 * DAY };
      const threshold = ms[timeRange];
      if (threshold) {
        const now = Date.now();
        list = list.filter((item) => item.pubDate && now - new Date(item.pubDate).getTime() < threshold);
      }
    }
    return list;
  }, [items, keyword, source, dateFrom, dateTo, timeRange]);

  const { sorted, sortKey, sortDir, onSort } = useSortable<NewsItem>(filtered, { key: "pubDate", dir: "desc" });

  const groups = useMemo(() => {
    const map = new Map<TimeGroup, NewsItem[]>();
    for (const item of sorted) {
      const g = getTimeGroup(item.pubDate);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    }
    return Array.from(map.entries());
  }, [sorted]);

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 px-5 pt-4 pb-3 border-b border-line">
        <h1 className="font-sans text-[15px] font-semibold tracking-tight text-ink-800">
          {labels.title}
          <span className="ml-2 font-mono text-[11px] tabular-nums text-ink-400">{total}</span>
        </h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <TimeRangeBar value={timeRange} onChange={(v) => fp.set("timeRange", v)} labels={labels.timeRange} />
          <ExportButton entity="news" format="csv" label={labels.exportCSV} />
          <ExportButton entity="news" format="json" label={labels.exportJSON} />
          <MobileFilterBar label={labels.filter}>
            <input
              type="text"
              key={keyword}
              defaultValue={keyword}
              placeholder={labels.searchPlaceholder}
              onBlur={(e) => { const v = e.target.value.trim(); if (v !== keyword) fp.set("keyword", v); }}
              onKeyDown={(e) => { if (e.key === "Enter") { const v = e.currentTarget.value.trim(); if (v !== keyword) fp.set("keyword", v); } }}
              className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full sm:w-40"
            />
            {sources.length > 1 && (
              <select
                value={source}
                onChange={(e) => fp.set("source", e.target.value)}
                className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full sm:w-auto"
              >
                <option value="">{labels.allSources}</option>
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
          </MobileFilterBar>
        </div>
      </div>
      <FilterSummary
        filters={[
          ...(keyword ? [{ label: labels.searchPlaceholder, value: keyword }] : []),
          ...(source ? [{ label: labels.allSources, value: source }] : []),
          ...(dateFrom ? [{ label: labels.dateFrom, value: dateFrom }] : []),
          ...(dateTo ? [{ label: labels.dateTo, value: dateTo }] : []),
        ]}
        labels={{ activeFilters: labels.activeFilters, clearAll: labels.clearAll }}
        onClear={fp.clearAll}
      />
      {!loading && !error && sorted.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-2 border-b border-line bg-paper/20">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-400">{labels.sortLabel}</span>
          <SortableHeaderClient column="title" label={labels.titleLabel} currentSort={sortKey ?? undefined} currentDir={sortDir as SortDir | undefined} onSort={onSort} />
          <SortableHeaderClient column="source" label={labels.sourceLabel} currentSort={sortKey ?? undefined} currentDir={sortDir as SortDir | undefined} onSort={onSort} />
          <SortableHeaderClient column="pubDate" label={labels.pubDateLabel} currentSort={sortKey ?? undefined} currentDir={sortDir as SortDir | undefined} onSort={onSort} />
        </div>
      )}
      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState message={labels.errorMessage} onRetry={() => fetchPage(page)} retryLabel={labels.retryLabel} />
      ) : sorted.length === 0 ? (
        <EmptyState title={labels.noMatch} description={labels.emptyDesc} compact />
      ) : (
        <div>
          {groups.map(([group, groupItems]) => (
            <div key={group}>
              <TimeGroupHeader group={group} count={groupItems.length} labels={labels.timeGroup} />
              <div className="divide-y divide-line">
                {groupItems.map((item) => {
                  const stale = isExpired(item.pubDate, 30);
                  return (
                    <a
                      key={item.link}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block px-5 py-4 hover:bg-paper/40 transition-colors ${stale ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        <p className={`text-[13px] font-medium flex-1 ${stale ? "text-ink-500" : "text-ink-800"}`}>{item.title}</p>
                        {isNew(item.pubDate) && <NewBadge label={labels.newLabel} />}
                      </div>
                      {item.snippet && (
                        <p className="text-[12px] text-ink-400 mt-1.5 line-clamp-2">{item.snippet}</p>
                      )}
                      <p className="text-[11px] text-ink-300 mt-1.5 font-mono">
                        {item.source && <span className="text-navy-500">{item.source}</span>}
                        {item.source && " · "}
                        {extractDomain(item.link)}
                        {item.pubDate && <> · <span className="text-ink-400">{relativeTime(item.pubDate, lang)}</span></>}
                      </p>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <PaginationClient
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        labels={{ rows: labels.rows, page: labels.page }}
      />
    </div>
  );
}
