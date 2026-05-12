"use client";

import { useState, useMemo } from "react";
import { TopicTag } from "@/components/admin/TopicTag";
import { EmptyState } from "@/components/admin/EmptyState";
import { PaginationClient } from "@/components/admin/PaginationClient";
import { SortableHeaderClient } from "@/components/admin/SortableHeader";
import { groupSessionsByTopic } from "@/lib/admin/session-utils";
import type { ConferenceSession } from "@/lib/admin/types";
import type { Lang } from "@/lib/i18n/dict";
import type { SortDir } from "@/lib/admin/pagination";
import { getTopicLabel } from "@/lib/admin/topics";
import { tabClass } from "@/lib/admin/ui";

type SessionsPanelLabels = {
  searchSessions: string;
  expandAll: string;
  collapseAll: string;
  showAbstract: string;
  hideAbstract: string;
  papers: string;
  noMatch: string;
  noMatchDesc: string;
  entries: string;
  groupedView: string;
  tableView: string;
  affiliations: string;
  rows: string;
  page: string;
};

const COLLAPSED_LIMIT = 3;
const PAGE_SIZE = 20;

type TableSortKey = "title" | "authors" | "affiliations" | "topics";

export function SessionsPanel({ sessions, labels, lang }: { sessions: ConferenceSession[]; labels: SessionsPanelLabels; lang: Lang }) {
  const [query, setQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"grouped" | "table">("grouped");
  const [sortKey, setSortKey] = useState<TableSortKey>("topics");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query) return sessions;
    const q = query.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.authors.some((a) => a.toLowerCase().includes(q)) ||
        s.topics.some((t) => t.toLowerCase().includes(q)),
    );
  }, [sessions, query]);

  const groups = useMemo(() => groupSessionsByTopic(filtered), [filtered]);

  const sorted = useMemo(() => {
    const mult = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "title") return mult * a.title.localeCompare(b.title);
      if (sortKey === "authors") return mult * (a.authors[0] ?? "").localeCompare(b.authors[0] ?? "");
      if (sortKey === "affiliations") return mult * (a.affiliations[0] ?? "").localeCompare(b.affiliations[0] ?? "");
      return mult * (a.topics[0] ?? "").localeCompare(b.topics[0] ?? "");
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    const from = (page - 1) * PAGE_SIZE;
    return sorted.slice(from, from + PAGE_SIZE);
  }, [sorted, page]);

  const allExpanded = groups.length > 0 && groups.every((g) => expandedGroups.has(g.topic));

  function toggleAll() {
    if (allExpanded) {
      setExpandedGroups(new Set());
    } else {
      setExpandedGroups(new Set(groups.map((g) => g.topic)));
    }
  }

  function toggleGroup(topic: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }

  function toggleAbstract(id: string) {
    setExpandedAbstracts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSort(col: string, dir: SortDir | null) {
    if (dir) {
      setSortKey(col as TableSortKey);
      setSortDir(dir);
    } else {
      setSortKey("topics");
      setSortDir("asc");
    }
    setPage(1);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-line">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder={labels.searchSessions}
          className="rounded-md border border-line bg-surface px-2.5 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full sm:w-56"
        />
        <span className="font-mono text-[10px] text-ink-400">
          {filtered.length} {labels.entries}
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <button type="button" onClick={() => setView("grouped")} className={tabClass(view === "grouped", "sm")}>
            {labels.groupedView}
          </button>
          <button type="button" onClick={() => { setView("table"); setPage(1); }} className={tabClass(view === "table", "sm")}>
            {labels.tableView}
          </button>
          {view === "grouped" && groups.length > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-navy-500 hover:text-navy-700 transition-colors"
            >
              {allExpanded ? labels.collapseAll : labels.expandAll}
            </button>
          )}
        </div>
      </div>

      {view === "grouped" ? (
        /* Grouped view — unchanged */
        groups.length === 0 ? (
          <EmptyState title={labels.noMatch} description={labels.noMatchDesc} compact />
        ) : (
          <div>
            {groups.map((g) => {
              const isExpanded = expandedGroups.has(g.topic);
              const visibleSessions = isExpanded ? g.sessions : g.sessions.slice(0, COLLAPSED_LIMIT);
              const hasMore = g.sessions.length > COLLAPSED_LIMIT;

              return (
                <div key={g.topic}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(g.topic)}
                    className="flex items-center gap-3 w-full px-5 py-2.5 bg-paper/40 border-b border-line hover:bg-paper/60 transition-colors text-left select-none"
                  >
                    <svg
                      viewBox="0 0 12 12"
                      className={`h-3 w-3 shrink-0 text-ink-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    >
                      <path d="M4.5 3 L7.5 6 L4.5 9" />
                    </svg>
                    <TopicTag label={g.topic} lang={lang} />
                    <span className="font-mono text-[10px] tabular-nums text-ink-400">
                      {g.sessions.length} {labels.papers}
                    </span>
                  </button>

                  <div className="divide-y divide-line">
                    {visibleSessions.map((s) => (
                      <div key={s.id} className="px-5 py-3 hover:bg-paper/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-[14px] tracking-tight text-ink-900">
                              {s.url ? (
                                <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-navy-700">
                                  {s.title}
                                </a>
                              ) : (
                                s.title
                              )}
                            </p>
                            <p className="font-mono text-[11px] text-ink-500 mt-1 truncate">
                              {s.authors.join(", ") || "—"}
                            </p>
                            {s.topics.length > 1 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {s.topics.slice(1).map((tp) => (
                                  <TopicTag key={tp} label={tp} lang={lang} />
                                ))}
                              </div>
                            )}
                          </div>
                          {s.abstract && (
                            <button
                              type="button"
                              onClick={() => toggleAbstract(s.id)}
                              className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-navy-500 hover:text-navy-700 mt-0.5"
                            >
                              {expandedAbstracts.has(s.id) ? labels.hideAbstract : labels.showAbstract}
                            </button>
                          )}
                        </div>
                        {expandedAbstracts.has(s.id) && s.abstract && (
                          <p className="mt-2 text-[12px] text-ink-500 leading-relaxed bg-paper/40 rounded-md px-3 py-2">
                            {s.abstract}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {hasMore && !isExpanded && (
                    <button
                      type="button"
                      onClick={() => toggleGroup(g.topic)}
                      className="w-full px-5 py-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-navy-500 hover:text-navy-700 border-b border-line transition-colors"
                    >
                      +{g.sessions.length - COLLAPSED_LIMIT} more
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Table view */
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line bg-paper/30">
                  <th className="px-4 py-2.5">
                    <SortableHeaderClient column="title" label="Title" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2.5">
                    <SortableHeaderClient column="authors" label="Authors" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2.5">
                    <SortableHeaderClient column="affiliations" label={labels.affiliations} currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2.5">
                    <SortableHeaderClient column="topics" label="Topics" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    Abstract
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState title={labels.noMatch} description={labels.noMatchDesc} compact />
                    </td>
                  </tr>
                )}
                {paginated.map((s) => (
                  <tr key={s.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-4 py-3 align-top">
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer" className="text-[13px] font-medium text-ink-800 hover:text-navy-700 line-clamp-2 max-w-[280px] block">
                          {s.title}
                        </a>
                      ) : (
                        <span className="text-[13px] font-medium text-ink-800 line-clamp-2 max-w-[280px] block">{s.title}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="text-[12px] text-ink-600 line-clamp-1 max-w-[180px] block">
                        {s.authors.length > 0
                          ? s.authors.slice(0, 2).join(", ") + (s.authors.length > 2 ? ` +${s.authors.length - 2}` : "")
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="text-[12px] text-ink-600 line-clamp-1 max-w-[160px] block">
                        {s.affiliations.length > 0
                          ? s.affiliations[0] + (s.affiliations.length > 1 ? ` +${s.affiliations.length - 1}` : "")
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {s.topics.length > 0
                          ? s.topics.slice(0, 3).map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)
                          : <span className="text-ink-400">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {s.abstract ? (
                        expandedAbstracts.has(s.id) ? (
                          <div>
                            <p className="text-[12px] text-ink-500 leading-relaxed max-w-[300px]">{s.abstract}</p>
                            <button
                              type="button"
                              onClick={() => toggleAbstract(s.id)}
                              className="font-mono text-[9px] uppercase tracking-[0.12em] text-navy-500 hover:text-navy-700 mt-1"
                            >
                              {labels.hideAbstract}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleAbstract(s.id)}
                            className="text-[12px] text-ink-400 hover:text-ink-600 line-clamp-1 max-w-[200px] block text-left"
                          >
                            {s.abstract.slice(0, 80)}…
                          </button>
                        )
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
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
      )}
    </div>
  );
}
