"use client";

import { useState } from "react";
import type { Paper } from "@/lib/admin/types";

type Venue = { key: string; label: string };

export function PapersClient({ initialPapers, venues }: { initialPapers: Paper[]; venues: Venue[] }) {
  const [papers, setPapers] = useState<Paper[]>(initialPapers);
  const [loading, setLoading] = useState(false);
  const [venue, setVenue] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function search() {
    setLoading(true);
    setMessage(null);
    try {
      const params = new URLSearchParams({ year: "2026" });
      if (venue) params.set("venue", venue);
      const res = await fetch(`/api/papers/search?${params}`);
      const data = await res.json();
      if (data.error) {
        setMessage(`错误: ${data.error}`);
      } else {
        setPapers(data.papers);
        setMessage(`找到 ${data.total} 篇，新导入 ${data.imported} 篇`);
      }
    } catch {
      setMessage("请求失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-surface">
      {/* Search bar */}
      <div className="flex flex-wrap items-center gap-3 px-5 pt-4 pb-3 border-b border-line">
        <h1 className="font-display text-[17px] tracking-tight text-ink-800">
          论文
          <span className="ml-2 font-mono text-[11px] tabular-nums text-ink-400">{papers.length}</span>
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="rounded-md border border-line bg-surface px-2 py-1 text-[12px] text-ink-700"
          >
            <option value="">全部会议</option>
            {venues.map((v) => (
              <option key={v.key} value={v.key}>{v.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={search}
            disabled={loading}
            className="rounded-md bg-navy-700 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-navy-50 hover:bg-navy-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "搜索中…" : "搜索 2026"}
          </button>
        </div>
        {message && <p className="w-full text-[11px] text-ink-400 mt-1">{message}</p>}
      </div>

      {/* Paper list */}
      {papers.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-ink-400">
          暂无论文，选择会议后点击"搜索 2026"自动抓取并入库
        </div>
      ) : (
        <div className="divide-y divide-line">
          {papers.map((p) => (
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
