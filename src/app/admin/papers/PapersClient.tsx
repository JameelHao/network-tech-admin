"use client";

import { useState, useMemo } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { NewBadge } from "@/components/admin/NewBadge";
import { TimeGroupHeader } from "@/components/admin/TimeGroupHeader";
import { TimeRangeBar } from "@/components/admin/TimeRangeBar";
import { ExportButton } from "@/components/admin/ExportButton";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { FavoriteFilter } from "@/components/admin/FavoriteFilter";
import { MobileFilterBar } from "@/components/admin/MobileFilterBar";
import { DuplicateWarning } from "@/components/admin/DuplicateWarning";
import { FilterSummary } from "@/components/admin/FilterSummary";
import { clusterByTopics } from "@/lib/admin/paper-utils";
import { relativeTime, isCurrentYear, getTimeGroup, isNew, isExpired } from "@/lib/admin/format";
import type { TimeGroup } from "@/lib/admin/format";
import { SortableHeaderClient } from "@/components/admin/SortableHeader";
import { useFilterParams } from "@/hooks/useFilterParams";
import { useFavorites } from "@/hooks/useFavorites";
import { useSortable } from "@/hooks/useSortable";
import type { Paper } from "@/lib/admin/types";
import type { DuplicateGroup } from "@/lib/admin/paper-dedup";
import type { Lang } from "@/lib/i18n/dict";
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
  timeGroup: Record<TimeGroup, string>;
  newLabel: string;
  favorites: string;
  favoritesAll: string;
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

export function PapersClient({ papers, duplicateGroups, labels, lang }: { papers: Paper[]; duplicateGroups?: DuplicateGroup[]; labels: PapersLabels; lang: Lang }) {
  const fp = useFilterParams();
  const keyword = fp.get("keyword");
  const venue = fp.get("venue");
  const topic = fp.get("topic");
  const dateFrom = fp.get("dateFrom");
  const dateTo = fp.get("dateTo");
  const timeRange = fp.get("timeRange");
  const [viewMode, setViewMode] = useState<"list" | "cluster">("list");
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);
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
  }, [papers, keyword, venue, topic, dateFrom, dateTo, timeRange, showOnlyFavs, favIds]);

  const { sorted, sortKey, sortDir, onSort } = useSortable<Paper>(filtered, { key: "published_date", dir: "desc" });

  const clusters = useMemo(() => clusterByTopics(sorted), [sorted]);

  const groups = useMemo(() => {
    const map = new Map<TimeGroup, Paper[]>();
    for (const p of sorted) {
      const g = getTimeGroup(p.published_date);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(p);
    }
    return Array.from(map.entries());
  }, [sorted]);

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 px-5 pt-4 pb-3 border-b border-line">
        <h1 className="font-display text-[17px] tracking-tight text-ink-800">
          {labels.title}
          <span className="ml-2 font-mono text-[11px] tabular-nums text-ink-400">{filtered.length}</span>
        </h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <FavoriteFilter entity="papers" labels={{ favorites: labels.favorites, all: labels.favoritesAll }} onToggle={setShowOnlyFavs} />
          <TimeRangeBar value={timeRange} onChange={(v) => fp.set("timeRange", v)} labels={labels.timeRange} />
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
              key={keyword}
              defaultValue={keyword}
              placeholder={labels.searchPlaceholder}
              onBlur={(e) => { const v = e.target.value.trim(); if (v !== keyword) fp.set("keyword", v); }}
              onKeyDown={(e) => { if (e.key === "Enter") { const v = e.currentTarget.value.trim(); if (v !== keyword) fp.set("keyword", v); } }}
              className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full sm:w-40"
            />
            {venues.length > 1 && (
              <select
                value={venue}
                onChange={(e) => fp.set("venue", e.target.value)}
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
                onChange={(e) => fp.set("topic", e.target.value)}
                className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full sm:w-auto"
              >
                <option value="">{labels.allCategories}</option>
                {topics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => fp.set("dateFrom", e.target.value)}
                aria-label={labels.dateFrom}
                className="rounded-md border border-line bg-surface px-2 py-1 min-h-[36px] text-[12px] text-ink-700 w-[130px]"
              />
              <span className="text-ink-400 text-[10px]">–</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => fp.set("dateTo", e.target.value)}
                aria-label={labels.dateTo}
                className="rounded-md border border-line bg-surface px-2 py-1 min-h-[36px] text-[12px] text-ink-700 w-[130px]"
              />
            </div>
          </MobileFilterBar>
        </div>
      </div>

      <FilterSummary
        filters={[
          ...(keyword ? [{ label: labels.searchPlaceholder, value: keyword }] : []),
          ...(venue ? [{ label: labels.allSources, value: venue }] : []),
          ...(topic ? [{ label: labels.allCategories, value: topic }] : []),
          ...(dateFrom ? [{ label: labels.dateFrom, value: dateFrom }] : []),
          ...(dateTo ? [{ label: labels.dateTo, value: dateTo }] : []),
        ]}
        labels={{ activeFilters: labels.activeFilters, clearAll: labels.clearAll }}
        onClear={fp.clearAll}
      />

      {duplicateGroups && duplicateGroups.length > 0 && (
        <DuplicateWarning groups={duplicateGroups} labels={labels.dedup} />
      )}

      {viewMode === "list" && sorted.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-2 border-b border-line bg-paper/20">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-400">{labels.sortLabel}</span>
          <SortableHeaderClient column="title" label={labels.titleLabel} currentSort={sortKey ?? undefined} currentDir={sortDir as SortDir | undefined} onSort={onSort} />
          <SortableHeaderClient column="published_date" label={labels.publishedAt} currentSort={sortKey ?? undefined} currentDir={sortDir as SortDir | undefined} onSort={onSort} />
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState title={labels.noMatch} description={labels.emptyDesc} compact />
      ) : viewMode === "list" ? (
        <div>
          {groups.map(([group, groupItems]) => (
            <div key={group}>
              <TimeGroupHeader group={group} count={groupItems.length} labels={labels.timeGroup} />
              <div className="divide-y divide-line">
                {groupItems.map((p) => (
                  <PaperRow key={p.id} paper={p} lang={lang} publishedLabel={labels.publishedAt} newLabel={labels.newLabel} />
                ))}
              </div>
            </div>
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
      className={`block px-5 py-4 hover:bg-paper/40 transition-colors ${stale ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-2">
        <p className={`text-[13px] font-medium flex-1 ${stale ? "text-ink-500" : "text-ink-800"}`}>{p.title}</p>
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
