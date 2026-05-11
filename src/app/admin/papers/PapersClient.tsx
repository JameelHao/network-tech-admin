"use client";

import { useState, useMemo } from "react";
import { ExportButton } from "@/components/admin/ExportButton";
import { MobileFilterBar } from "@/components/admin/MobileFilterBar";
import { clusterByTopics } from "@/lib/admin/paper-utils";
import type { Paper } from "@/lib/admin/types";

type PapersLabels = {
  title: string;
  searchPlaceholder: string;
  allSources: string;
  allCategories: string;
  noMatch: string;
  exportCSV: string;
  exportJSON: string;
  viewList: string;
  viewCluster: string;
  papersCount: string;
  dateRange: string;
  filter: string;
};

export function PapersClient({ papers, labels }: { papers: Paper[]; labels: PapersLabels }) {
  const [keyword, setKeyword] = useState("");
  const [venue, setVenue] = useState("");
  const [topic, setTopic] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "cluster">("list");

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

  const clusters = useMemo(() => clusterByTopics(filtered), [filtered]);

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 px-5 pt-4 pb-3 border-b border-line">
        <h1 className="font-display text-[17px] tracking-tight text-ink-800">
          {labels.title}
          <span className="ml-2 font-mono text-[11px] tabular-nums text-ink-400">{filtered.length}</span>
        </h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-full border border-line overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 min-h-[36px] font-mono text-[10px] uppercase tracking-[0.14em] transition-colors whitespace-nowrap ${
                viewMode === "list" ? "bg-navy-700 text-navy-50" : "text-ink-500 hover:text-ink-800"
              }`}
            >
              {labels.viewList}
            </button>
            <button
              onClick={() => setViewMode("cluster")}
              className={`px-3 py-1.5 min-h-[36px] font-mono text-[10px] uppercase tracking-[0.14em] transition-colors whitespace-nowrap ${
                viewMode === "cluster" ? "bg-navy-700 text-navy-50" : "text-ink-500 hover:text-ink-800"
              }`}
            >
              {labels.viewCluster}
            </button>
          </div>
          <ExportButton entity="papers" format="csv" label={labels.exportCSV} />
          <ExportButton entity="papers" format="json" label={labels.exportJSON} />
          <MobileFilterBar label={labels.filter}>
            <input
              type="text"
              placeholder={labels.searchPlaceholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full sm:w-40"
            />
            {venues.length > 1 && (
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full sm:w-auto"
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
                onChange={(e) => setTopic(e.target.value)}
                className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full sm:w-auto"
              >
                <option value="">{labels.allCategories}</option>
                {topics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </MobileFilterBar>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-ink-400">
          {labels.noMatch}
        </div>
      ) : viewMode === "list" ? (
        <div className="divide-y divide-line">
          {filtered.map((p) => (
            <PaperRow key={p.id} paper={p} />
          ))}
        </div>
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
                <span className="rounded-full bg-navy-700 text-navy-50 px-1.5 py-0.5 font-mono text-[9px]">
                  {cluster.count} {labels.papersCount}
                </span>
                <span className="font-mono text-[10px] text-ink-400 ml-auto">
                  {labels.dateRange}: {cluster.dateRange}
                </span>
              </summary>
              <div className="divide-y divide-line border-t border-line">
                {cluster.papers.map((p) => (
                  <PaperRow key={p.id} paper={p} />
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

function PaperRow({ paper: p }: { paper: Paper }) {
  return (
    <a
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
  );
}
