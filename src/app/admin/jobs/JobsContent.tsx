"use client";

import { useEffect, useState } from "react";

type JobItem = { title: string; link: string; snippet: string };

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

export function JobsContent() {
  const [items, setItems] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        setItems(data.items ?? []);
      })
      .catch(() => setError("Failed to fetch jobs"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="px-5 pt-4 pb-3 border-b border-line">
        <h1 className="font-display text-[17px] tracking-tight text-ink-800">网络岗位招聘</h1>
      </div>
      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className="px-5 py-10 text-center text-sm text-ink-400">{error}</div>
      ) : items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-ink-400">暂无数据</div>
      ) : (
        <div className="divide-y divide-line">
          {items.map((item) => (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-5 py-4 hover:bg-paper/40 transition-colors"
            >
              <p className="text-[13px] font-medium text-ink-800">{item.title}</p>
              <p className="text-[12px] text-ink-400 mt-1.5 line-clamp-2">{item.snippet}</p>
              <p className="text-[11px] text-ink-300 mt-1.5 font-mono">{extractDomain(item.link)}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
