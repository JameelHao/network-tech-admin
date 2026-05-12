"use client";

import { useState, useMemo } from "react";
import { TopicTag } from "@/components/admin/TopicTag";
import { EmptyState } from "@/components/admin/EmptyState";
import { groupSessionsByTopic } from "@/lib/admin/session-utils";
import type { ConferenceSession } from "@/lib/admin/types";
import type { Lang } from "@/lib/i18n/dict";
import { getTopicLabel } from "@/lib/admin/topics";

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
};

const COLLAPSED_LIMIT = 3;

export function SessionsPanel({ sessions, labels, lang }: { sessions: ConferenceSession[]; labels: SessionsPanelLabels; lang: Lang }) {
  const [query, setQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<string>>(new Set());

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

  return (
    <div>
      {/* Search + controls */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-line">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchSessions}
          className="rounded-md border border-line bg-surface px-2.5 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-full sm:w-56"
        />
        <span className="font-mono text-[10px] text-ink-400">
          {filtered.length} {labels.entries}
        </span>
        {groups.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-navy-500 hover:text-navy-700 transition-colors"
          >
            {allExpanded ? labels.collapseAll : labels.expandAll}
          </button>
        )}
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <EmptyState title={labels.noMatch} description={labels.noMatchDesc} compact />
      ) : (
        <div>
          {groups.map((g) => {
            const isExpanded = expandedGroups.has(g.topic);
            const visibleSessions = isExpanded ? g.sessions : g.sessions.slice(0, COLLAPSED_LIMIT);
            const hasMore = g.sessions.length > COLLAPSED_LIMIT;

            return (
              <div key={g.topic}>
                {/* Group header */}
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

                {/* Session rows */}
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

                {/* Show more toggle */}
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
      )}
    </div>
  );
}
