"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { MobileFilterBar } from "@/components/admin/MobileFilterBar";
import { PaginationClient } from "@/components/admin/PaginationClient";
import { SortableHeaderClient } from "@/components/admin/SortableHeader";
import { relativeTime, isExpired } from "@/lib/admin/format";
import { useSortable } from "@/hooks/useSortable";
import type { Lang } from "@/lib/i18n/dict";
import type { SortDir } from "@/lib/admin/pagination";

type JobItem = { title: string; link: string; snippet: string; source?: string; pubDate?: string };

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

type JobsLabels = {
  title: string;
  searchPlaceholder: string;
  allSources: string;
  noMatch: string;
  rows: string;
  page: string;
  filter: string;
  expired: string;
  sortLabel: string;
  titleLabel: string;
  sourceLabel: string;
  pubDateLabel: string;
};

export function JobsContent({ labels, lang }: { labels: JobsLabels; lang: Lang }) {
  const [items, setItems] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 25;

  const fetchPage = useCallback((p: number) => {
    setLoading(true);
    fetch(`/api/jobs?page=${p}&size=${pageSize}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => setError("Failed to fetch jobs"))
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
    return list;
  }, [items, keyword, source]);

  const { sorted, sortKey, sortDir, onSort } = useSortable<JobItem>(filtered, { key: "pubDate", dir: "desc" });

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 px-5 pt-4 pb-3 border-b border-line">
        <h1 className="font-display text-[17px] tracking-tight text-ink-800">
          {labels.title}
          <span className="ml-2 font-mono text-[11px] tabular-nums text-ink-400">{total}</span>
        </h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <MobileFilterBar label={labels.filter}>
            <input
              type="text"
              placeholder={labels.searchPlaceholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full sm:w-40"
            />
            {sources.length > 1 && (
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full sm:w-auto"
              >
                <option value="">{labels.allSources}</option>
                {sources.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </MobileFilterBar>
        </div>
      </div>
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
        <div className="px-5 py-10 text-center text-sm text-ink-400">{error}</div>
      ) : sorted.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-ink-400">{labels.noMatch}</div>
      ) : (
        <div className="divide-y divide-line">
          {sorted.map((item) => {
            const expired = isExpired(item.pubDate, 30);
            return (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`block px-5 py-4 hover:bg-paper/40 transition-colors ${expired ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <p className={`text-[13px] font-medium flex-1 ${expired ? "text-ink-500" : "text-ink-800"}`}>{item.title}</p>
                  {expired && (
                    <span className="shrink-0 rounded-full bg-ink-100 px-1.5 py-0.5 font-mono text-[9px] text-ink-500">{labels.expired}</span>
                  )}
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
