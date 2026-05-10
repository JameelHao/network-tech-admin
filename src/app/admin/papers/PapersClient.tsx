"use client";

import { useState, useMemo } from "react";
import type { Paper } from "@/lib/admin/types";

export function PapersClient({ papers }: { papers: Paper[] }) {
  const [keyword, setKeyword] = useState("");
  const [venue, setVenue] = useState("");
  const [topic, setTopic] = useState("");

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
    return list;
  }, [papers, keyword, venue, topic]);

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 px-5 pt-4 pb-3 border-b border-line">
        <h1 className="font-display text-[17px] tracking-tight text-ink-800">
          2026 网络论文
          <span className="ml-2 font-mono text-[11px] tabular-nums text-ink-400">{filtered.length}</span>
        </h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="搜索标题/作者..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="rounded-md border border-line bg-surface px-2 py-1 text-[12px] text-ink-700 w-40"
          />
          {venues.length > 1 && (
            <select
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="rounded-md border border-line bg-surface px-2 py-1 text-[12px] text-ink-700"
            >
              <option value="">全部来源</option>
              {venues.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          )}
          {topics.length > 1 && (
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-md border border-line bg-surface px-2 py-1 text-[12px] text-ink-700"
            >
              <option value="">全部分类</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-ink-400">
          暂无匹配论文
        </div>
      ) : (
        <div className="divide-y divide-line">
          {filtered.map((p) => (
            <a
              key={p.id}
              href={p.url || `https://scholar.google.com/scholar?q=${encodeURIComponent(p.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-5 py-4 hover:bg-paper/40 transition-colors"
            >
              <p className="text-[13px] font-medium text-ink-800">{p.title}</p>
              <p className="text-[12px] text-ink-500 mt-1">
                {p.authors.slice(0, 5).join(", ")}{p.authors.length > 5 ? ` +${p.authors.length - 5}` : ""}
                {p.venue && <> · <span className="text-navy-500">{p.venue}</span></>}
              </p>
              {p.abstract && (
                <p className="text-[12px] text-ink-400 mt-1.5 line-clamp-2">{p.abstract}</p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
