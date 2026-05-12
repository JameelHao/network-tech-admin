"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { TopicStat } from "@/lib/admin/topic-aggregator";
import { TopicHeatmap } from "@/components/admin/TopicHeatmap";
import { TopicTag } from "@/components/admin/TopicTag";
import { EmptyState } from "@/components/admin/EmptyState";
import { SortableHeaderClient } from "@/components/admin/SortableHeader";
import { TOPIC_CATEGORIES, getTopicLabel, type TopicCategory } from "@/lib/admin/topics";
import type { Lang } from "@/lib/i18n/dict";
import type { SortDir } from "@/lib/admin/pagination";

type TopicsLabels = {
  title: string;
  table: string;
  heatmap: string;
  search: string;
  allCategories: string;
  total: string;
  duplicateWarning: string;
  similarTo: string;
  noTopics: string;
  noTopicsDesc: string;
  items: string;
  papers: string;
  conferences: string;
  talents: string;
  opensource: string;
};

type SortKey = "slug" | "total" | "papers" | "conferences" | "talents" | "opensource";

const ENTITY_PATHS: Record<string, string> = {
  papers: "/admin/papers",
  conferences: "/admin/conferences",
  talents: "/admin/talents",
  opensource: "/admin/opensource",
};

const ENTITY_ICONS: Record<string, string> = {
  papers: "📄",
  conferences: "🎤",
  talents: "👤",
  opensource: "💻",
};

const DRILL_LIMIT = 5;

export function TopicsClient({ stats, labels, lang }: { stats: TopicStat[]; labels: TopicsLabels; lang: Lang }) {
  const [view, setView] = useState<"table" | "heatmap">("table");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = stats;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        s.slug.toLowerCase().includes(q) || getTopicLabel(s.slug, lang).toLowerCase().includes(q),
      );
    }
    if (category !== "all") {
      list = list.filter((s) => s.category === category);
    }
    return list;
  }, [stats, search, category, lang]);

  const sorted = useMemo(() => {
    const mult = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "slug") return mult * a.slug.localeCompare(b.slug);
      if (sortKey === "total") return mult * (a.total - b.total);
      return mult * ((a.counts[sortKey as keyof typeof a.counts] ?? 0) - (b.counts[sortKey as keyof typeof b.counts] ?? 0));
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(col: string, dir: SortDir | null) {
    if (dir) {
      setSortKey(col as SortKey);
      setSortDir(dir);
    } else {
      setSortKey("total");
      setSortDir("desc");
    }
  }

  function toggleExpand(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  const dupGroups = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const s of stats) {
      if (s.duplicateGroup) {
        const arr = groups.get(s.duplicateGroup) ?? [];
        arr.push(s.slug);
        groups.set(s.duplicateGroup, arr);
      }
    }
    return groups;
  }, [stats]);

  const categoryKeys = Object.keys(TOPIC_CATEGORIES) as TopicCategory[];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="font-display text-[20px] sm:text-[22px] tracking-tight text-ink-900">
          {labels.title}
          <span className="ml-2 font-mono text-[13px] text-ink-400 tabular-nums">{filtered.length}</span>
        </h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={labels.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-[13px] text-ink-800 placeholder:text-ink-400 w-48 focus:outline-none focus:ring-1 focus:ring-navy-300"
          />
          <div className="flex items-center rounded-full border border-line overflow-hidden">
            <button
              type="button"
              onClick={() => setView("table")}
              className={`px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                view === "table" ? "bg-navy-700 text-navy-50" : "text-ink-500 hover:text-ink-800"
              }`}
            >
              {labels.table}
            </button>
            <button
              type="button"
              onClick={() => setView("heatmap")}
              className={`px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                view === "heatmap" ? "bg-navy-700 text-navy-50" : "text-ink-500 hover:text-ink-800"
              }`}
            >
              {labels.heatmap}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors border ${
            category === "all"
              ? "border-navy-300 bg-navy-50 text-navy-700"
              : "border-line text-ink-500 hover:text-ink-800"
          }`}
        >
          {labels.allCategories}
        </button>
        {categoryKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors border ${
              category === key
                ? "border-navy-300 bg-navy-50 text-navy-700"
                : "border-line text-ink-500 hover:text-ink-800"
            }`}
          >
            {TOPIC_CATEGORIES[key][lang]}
          </button>
        ))}
      </div>

      {view === "heatmap" ? (
        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <TopicHeatmap
            stats={sorted}
            lang={lang}
            entityLabels={{
              papers: labels.papers,
              conferences: labels.conferences,
              talents: labels.talents,
              opensource: labels.opensource,
            }}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-paper/30">
                  <th className="px-5 py-3">
                    <SortableHeaderClient column="slug" label="Topic" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    {labels.allCategories.replace("All ", "")}
                  </th>
                  {(["papers", "conferences", "talents", "opensource"] as const).map((e) => (
                    <th key={e} className="px-5 py-3">
                      <SortableHeaderClient
                        column={e}
                        label={labels[e]}
                        currentSort={sortKey}
                        currentDir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                  ))}
                  <th className="px-5 py-3">
                    <SortableHeaderClient column="total" label={labels.total} currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState title={labels.noTopics} description={labels.noTopicsDesc} compact />
                    </td>
                  </tr>
                )}
                {sorted.map((s) => {
                  const isExpanded = expanded.has(s.slug);
                  const isDup = !!s.duplicateGroup;
                  const dupSiblings = isDup ? (dupGroups.get(s.duplicateGroup!) ?? []).filter((sl) => sl !== s.slug) : [];

                  return (
                    <tr
                      key={s.slug}
                      className={`group cursor-pointer hover:bg-paper/40 transition-colors ${isDup ? "bg-amber-50/40" : ""}`}
                      onClick={() => toggleExpand(s.slug)}
                    >
                      <td className="px-5 py-3" colSpan={isExpanded ? 7 : 1}>
                        {isExpanded ? (
                          <DrillDown
                            stat={s}
                            lang={lang}
                            labels={labels}
                            isDup={isDup}
                            dupSiblings={dupSiblings}
                            onCollapse={() => toggleExpand(s.slug)}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <TopicTag label={s.slug} lang={lang} />
                            {isDup && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[9px] text-amber-700" title={`${labels.similarTo}: ${dupSiblings.join(", ")}`}>
                                {labels.duplicateWarning}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      {!isExpanded && (
                        <>
                          <td className="px-5 py-3 font-mono text-[10px] text-ink-500 uppercase tracking-[0.12em]">
                            {TOPIC_CATEGORIES[s.category as TopicCategory]?.[lang] ?? s.category}
                          </td>
                          {(["papers", "conferences", "talents", "opensource"] as const).map((e) => (
                            <td key={e} className="px-5 py-3 text-[13px] tabular-nums text-ink-700">
                              {s.counts[e] || <span className="text-ink-200">—</span>}
                            </td>
                          ))}
                          <td className="px-5 py-3 text-[13px] font-semibold tabular-nums text-ink-800">{s.total}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DrillDown({
  stat,
  lang,
  labels,
  isDup,
  dupSiblings,
  onCollapse,
}: {
  stat: TopicStat;
  lang: Lang;
  labels: TopicsLabels;
  isDup: boolean;
  dupSiblings: string[];
  onCollapse: () => void;
}) {
  const entities = ["papers", "conferences", "talents", "opensource"] as const;

  return (
    <div className="space-y-3 py-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TopicTag label={stat.slug} lang={lang} />
          <span className="font-mono text-[11px] text-ink-400 tabular-nums">
            {stat.total} {labels.items}
          </span>
          {isDup && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[9px] text-amber-700">
              {labels.similarTo}: {dupSiblings.map((s) => getTopicLabel(s, lang)).join(", ")}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCollapse();
          }}
          className="text-ink-400 hover:text-ink-700 transition-colors"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 10l4-4 4 4" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {entities.map((entity) => {
          const items = stat.items[entity];
          if (items.length === 0) return null;
          const label = labels[entity];
          const icon = ENTITY_ICONS[entity];
          const basePath = ENTITY_PATHS[entity];
          const shown = items.slice(0, DRILL_LIMIT);
          const remaining = items.length - DRILL_LIMIT;

          return (
            <div key={entity} className="rounded-md border border-line bg-paper/30 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500 mb-2">
                {icon} {label} ({items.length})
              </div>
              <ul className="space-y-1">
                {shown.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`${basePath}/${item.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[12px] text-navy-600 hover:text-navy-800 hover:underline truncate block"
                    >
                      {"title" in item ? item.title : item.name}
                    </Link>
                  </li>
                ))}
                {remaining > 0 && (
                  <li className="text-[11px] text-ink-400">+{remaining} more</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
