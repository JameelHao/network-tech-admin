"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/admin/EmptyState";
import { NewBadge } from "@/components/admin/NewBadge";

import { ExportButton } from "@/components/admin/ExportButton";
import { FavoriteButton } from "@/components/admin/FavoriteButton";

import { OverflowMenu } from "@/components/admin/OverflowMenu";
import { DuplicateWarning } from "@/components/admin/DuplicateWarning";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { PaginationClient } from "@/components/admin/PaginationClient";
import { TopicTag } from "@/components/admin/TopicTag";
import { clusterByTopics } from "@/lib/admin/paper-utils";
import { TOPIC_CATEGORIES, TOPICS } from "@/lib/admin/topics";
import { relativeTime, isCurrentYear, isNew, isExpired } from "@/lib/admin/format";
import { SortableHeaderClient } from "@/components/admin/SortableHeader";
import { useFilterParams } from "@/hooks/useFilterParams";
import { useFavorites } from "@/hooks/useFavorites";
import { useSortable } from "@/hooks/useSortable";
import type { Paper } from "@/lib/admin/types";
import type { DuplicateGroup } from "@/lib/admin/paper-dedup";
import type { Dict, Lang } from "@/lib/i18n/dict";
import { tabClass, tabGroupClass, badgeClass } from "@/lib/admin/ui";
import type { SortDir } from "@/lib/admin/pagination";
import { getPaperIdsByTopics } from "./actions/search";

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

export function PapersClient({ papers, duplicateGroups, labels, lang, t, now }: { papers: Paper[]; duplicateGroups?: DuplicateGroup[]; labels: PapersLabels; lang: Lang; t: Dict; now?: number }) {
  const fp = useFilterParams();
  const keyword = fp.get("keyword");
  const venue = fp.get("venue");
  const sourceFilter = fp.get("source");
  const dateFrom = fp.get("dateFrom");
  const dateTo = fp.get("dateTo");
  const timeRange = fp.get("timeRange");
  const [viewMode, setViewMode] = useState<"list" | "cluster">("list");
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  // Topic filter: React state + server-side, not URL-driven
  const [selectedTopics, setSelectedTopics] = useState<string[]>(() => fp.getAll("topics"));
  const filterCount = [keyword, venue, sourceFilter, dateFrom, dateTo, timeRange, selectedTopics.length > 0 ? "t" : null].filter(Boolean).length;
  const [topicFilteredIds, setTopicFilteredIds] = useState<Set<string> | null>(null);
  const [topicLoading, setTopicLoading] = useState(false);
  const { favIds } = useFavorites("papers");

  // Fetch matching paper IDs from server when topics change
  useEffect(() => {
    if (selectedTopics.length === 0) {
      setTopicFilteredIds(null);
      setPage(1);
      return;
    }
    let cancelled = false;
    setTopicLoading(true);
    getPaperIdsByTopics(selectedTopics).then((ids) => {
      if (!cancelled) {
        setTopicFilteredIds(new Set(ids));
        setTopicLoading(false);
        setPage(1);
      }
    });
    return () => { cancelled = true; };
  }, [selectedTopics]);

  const handleTopicToggle = useCallback((slug: string) => {
    setSelectedTopics((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const venues = useMemo(() => {
    const set = new Set<string>();
    for (const p of papers) {
      if (p.venue) set.add(p.venue);
    }
    return Array.from(set).sort();
  }, [papers]);

  const topics = useMemo(() => TOPICS.map((t) => t.slug), []);

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
    if (selectedTopics.length > 0) {
      if (topicFilteredIds) {
        list = list.filter((p) => topicFilteredIds.has(p.id));
      } else {
        // Fallback: client-side filter while server loads
        list = list.filter((p) => selectedTopics.every((t) => p.topics.includes(t)));
      }
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
  }, [papers, keyword, venue, topicFilteredIds, sourceFilter, dateFrom, dateTo, timeRange, showOnlyFavs, favIds]);

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
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`rounded-md border px-2.5 py-1.5 text-[11px] font-mono transition-colors ${showFilter ? "bg-navy-50 border-navy-300 text-navy-600" : "border-line text-ink-500 hover:bg-paper/40"}`}
          >
            {labels.filter}{filterCount > 0 ? ` (${filterCount})` : ""}
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <div className={tabGroupClass()}>
              <button onClick={() => setViewMode("list")} className={tabClass(viewMode === "list", "sm")}>{labels.viewList}</button>
              <button onClick={() => setViewMode("cluster")} className={tabClass(viewMode === "cluster", "sm")}>{labels.viewCluster}</button>
            </div>
          </div>
        </div>
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

      {showFilter && (
        <div className="px-5 py-4 border-b border-line bg-paper/20 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mb-2">{labels.searchPlaceholder}</p>
              <input
                type="text"
                key={keyword}
                defaultValue={keyword}
                placeholder={labels.searchPlaceholder}
                onBlur={(e) => { const v = e.target.value.trim(); if (v !== keyword) fp.set("keyword", v); }}
                onKeyDown={(e) => { if (e.key === "Enter") { const v = e.currentTarget.value.trim(); if (v !== keyword) fp.set("keyword", v); } }}
                className="rounded-md border border-line bg-surface px-2 py-1.5 text-[12px] text-ink-700 w-full"
              />
            </div>
            {venues.length > 1 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mb-2">{labels.venue}</p>
                <div className="flex flex-wrap gap-2">
                  {venues.map((v) => {
                    const active = venue === v;
                    return (
                      <button key={v} onClick={() => fp.set("venue", active ? "" : v)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${active ? "bg-navy-50 border-navy-300 text-navy-600" : "border-line text-ink-500 hover:bg-paper/40"}`}
                      >
                        {active && "✓ "}{v}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {sources.length > 1 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mb-2">{labels.source}</p>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s) => {
                    const active = sourceFilter === s;
                    return (
                      <button key={s} onClick={() => fp.set("source", active ? "" : s)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${active ? "bg-navy-50 border-navy-300 text-navy-600" : "border-line text-ink-500 hover:bg-paper/40"}`}
                      >
                        {active && "✓ "}{s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mb-2">{labels.dateRange}</p>
              <div className="flex items-center gap-1">
                <input type="date" value={dateFrom} onChange={(e) => fp.set("dateFrom", e.target.value)} aria-label={labels.dateFrom} className="rounded-md border border-line bg-surface px-2 py-1 text-[12px] text-ink-700 w-full sm:w-[130px]" />
                <span className="text-ink-400 text-[10px]">–</span>
                <input type="date" value={dateTo} onChange={(e) => fp.set("dateTo", e.target.value)} aria-label={labels.dateTo} className="rounded-md border border-line bg-surface px-2 py-1 text-[12px] text-ink-700 w-full sm:w-[130px]" />
              </div>
            </div>
          </div>
          {topics.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mb-2">{labels.topics}</p>
              <div className="flex items-center gap-2">
                <TopicMultiSelect topics={topics} selectedTopics={selectedTopics} onToggle={handleTopicToggle} labels={labels} />
                {topicLoading && (
                  <span className="h-3 w-3 animate-spin rounded-full border-[2px] border-navy-300 border-t-navy-700" />
                )}
              </div>
            </div>
          )}
<div className="flex items-center gap-2 pt-1">
            {filterCount > 0 && (
              <button onClick={() => { fp.clearAll(); setSelectedTopics([]); }} className="text-[11px] font-mono text-ink-400 hover:text-ink-700 transition-colors">
                ← {lang === "zh" ? "清除全部" : "Clear all"}
              </button>
            )}
            <button onClick={() => setShowFilter(false)} className="text-[11px] font-mono text-ink-400 hover:text-ink-700 transition-colors">
              {lang === "zh" ? "收起" : "Collapse"} ↑
            </button>
          </div>
        </div>
      )}

      <FilterSummary
          filters={[
            ...(keyword ? [{ label: labels.searchPlaceholder, value: keyword }] : []),
            ...(venue ? [{ label: labels.allSources, value: venue }] : []),
            ...(selectedTopics.length > 0 ? selectedTopics.map((t) => ({ label: labels.topics, value: TOPICS.find((x) => x.slug === t)?.zh ?? t })) : []),
            ...(sourceFilter ? [{ label: labels.source, value: sourceFilter }] : []),
            ...(dateFrom ? [{ label: labels.dateFrom, value: dateFrom }] : []),
            ...(dateTo ? [{ label: labels.dateTo, value: dateTo }] : []),
          ]}
          labels={{ activeFilters: labels.activeFilters, clearAll: labels.clearAll }}
          onClear={() => { fp.clearAll(); setSelectedTopics([]); }}
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
                    const stale = isExpired(p.published_date, 30, now);
                    return (
                      <tr key={p.id} className={`group border-b border-line last:border-b-0 hover:bg-paper/40 transition-colors ${stale ? "opacity-50" : ""}`}>
                        <Td>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/admin/papers/${p.id}`}
                              className={`line-clamp-2 max-w-full sm:max-w-[300px] hover:text-navy-700 ${stale ? "text-ink-500" : "text-ink-800"}`}
                            >
                              {p.title}
                            </Link>
                            {(p as any).ai_summary && <span className="shrink-0 text-[9px] font-mono bg-navy-100 text-navy-600 px-1.5 py-0.5 rounded">AI</span>}
                            {isNew(p.published_date, now) && <NewBadge label={labels.newLabel} />}
                          </div>
                        </Td>
                        <Td>
                          <span className="text-[12px] text-ink-600">
                            {p.authors.slice(0, 2).join(", ")}
                            {p.authors.length > 2 && <span className="text-ink-400"> +{p.authors.length - 2}</span>}
                          </span>
                        </Td>
                        <Td>
                          <div className="flex flex-wrap items-center gap-1">
                            {p.venue ? (
                              <span className="rounded-full bg-navy-50 border border-navy-200 px-2 py-0.5 font-mono text-[10px] text-navy-700">{p.venue}</span>
                            ) : <span className="text-ink-400">—</span>}
                            {p.companies?.map((c) => (
                              <span key={c} className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${COMPANY_COLORS[c] ?? "bg-zinc-100 text-zinc-600 border border-zinc-200"}`}>
                                {c}
                              </span>
                            ))}
                          </div>
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
                              {relativeTime(p.published_date, lang, now)}
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
                    <PaperRow key={p.id} paper={p} lang={lang} now={now} publishedLabel={labels.publishedAt} newLabel={labels.newLabel} />
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
    </div>
  );
}

function PaperRow({ paper: p, lang, now, publishedLabel, newLabel }: { paper: Paper; lang: Lang; now?: number; publishedLabel: string; newLabel: string }) {
  const yearBadge = p.published_date && !isCurrentYear(p.published_date, now)
    ? new Date(p.published_date).getFullYear().toString()
    : null;
  const stale = isExpired(p.published_date, 30, now);

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
        {isNew(p.published_date, now) && <NewBadge label={newLabel} />}
        {yearBadge && (
          <span className="shrink-0 rounded-full bg-ink-100 px-1.5 py-0.5 font-mono text-[9px] text-ink-500">{yearBadge}</span>
        )}
      </div>
      <p className="text-[12px] text-ink-500 mt-1">
        {p.authors.slice(0, 5).join(", ")}{p.authors.length > 5 ? ` +${p.authors.length - 5}` : ""}
        {p.venue && <> · <span className="text-navy-500">{p.venue}</span></>}
        {p.published_date && <> · <span className="text-ink-400">{relativeTime(p.published_date, lang, now)}</span></>}
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

import { COMPANY_COLORS } from "@/lib/admin/companies";

function TopicMultiSelect({
  topics,
  selectedTopics,
  onToggle,
  labels,
}: {
  topics: string[];
  selectedTopics: string[];
  onToggle: (slug: string) => void;
  labels: PapersLabels;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const slug of topics) {
      const def = TOPICS.find((t) => t.slug === slug);
      const cat = def?.category ?? "other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(slug);
    }
    return Array.from(map.entries()).sort();
  }, [topics]);

  // Position dropdown within viewport when opened
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open || !buttonRef.current) { setPos({}); return; }
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const maxH = Math.max(160, Math.min(400, spaceBelow));
    setPos({ position: "fixed", top: rect.bottom + 4, left: Math.min(rect.left, window.innerWidth - 340), maxHeight: maxH });
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 font-mono text-[11px] text-ink-600 hover:text-ink-800 hover:border-ink-300 transition-colors"
      >
        {labels.topics}
        {selectedTopics.length > 0 && (
          <span className="rounded-full bg-navy-700 text-white text-[9px] px-1.5 py-0.5 tabular-nums leading-tight">
            {selectedTopics.length}
          </span>
        )}
        <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 4.5 L6 7.5 L9 4.5" /></svg>
      </button>

      {open && (
        <div className="z-50 w-[320px] overflow-y-auto rounded-lg border border-line bg-surface shadow-lg" style={pos}>
          {grouped.map(([cat, slugs]) => {
            const catInfo = TOPIC_CATEGORIES[cat as keyof typeof TOPIC_CATEGORIES];
            return (
              <div key={cat} className="border-b border-line last:border-b-0">
                <div className="px-3 pt-2.5 pb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-500">
                  {catInfo?.zh ?? cat}
                </div>
                {slugs.map((slug) => {
                  const def = TOPICS.find((t) => t.slug === slug);
                  const active = selectedTopics.includes(slug);
                  return (
                    <label
                      key={slug}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-paper/40 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => onToggle(slug)}
                        className="rounded border-line text-navy-700 focus:ring-navy-500 h-3.5 w-3.5"
                      />
                      <span className={`text-[12px] ${active ? "text-ink-800 font-medium" : "text-ink-600"}`}>
                        {def?.zh ?? slug}
                      </span>
                      <span className="ml-auto text-[10px] text-ink-400">{slug}</span>
                    </label>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
