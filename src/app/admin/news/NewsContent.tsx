"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { PaginationClient } from "@/components/admin/PaginationClient";

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
  rows: string;
  page: string;
};

export function NewsContent({ labels }: { labels: NewsLabels }) {
  const [items, setItems] = useState<NewsItem[]>([]);
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
    return list;
  }, [items, keyword, source]);

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 px-5 pt-4 pb-3 border-b border-line">
        <h1 className="font-display text-[17px] tracking-tight text-ink-800">
          {labels.title}
          <span className="ml-2 font-mono text-[11px] tabular-nums text-ink-400">{total}</span>
        </h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder={labels.searchPlaceholder}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="rounded-md border border-line bg-surface px-2 py-1 text-[12px] text-ink-700 w-36"
          />
          {sources.length > 1 && (
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="rounded-md border border-line bg-surface px-2 py-1 text-[12px] text-ink-700"
            >
              <option value="">{labels.allSources}</option>
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className="px-5 py-10 text-center text-sm text-ink-400">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-ink-400">{labels.noMatch}</div>
      ) : (
        <div className="divide-y divide-line">
          {filtered.map((item) => (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-5 py-4 hover:bg-paper/40 transition-colors"
            >
              <p className="text-[13px] font-medium text-ink-800">{item.title}</p>
              {item.snippet && (
                <p className="text-[12px] text-ink-400 mt-1.5 line-clamp-2">{item.snippet}</p>
              )}
              <p className="text-[11px] text-ink-300 mt-1.5 font-mono">
                {item.source && <span className="text-navy-500">{item.source}</span>}
                {item.source && " · "}
                {extractDomain(item.link)}
              </p>
            </a>
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
