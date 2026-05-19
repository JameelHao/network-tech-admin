"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DetailModal } from "@/components/admin/DetailModal";
import type { TopicStat } from "@/lib/admin/topic-aggregator";
import { TopicHeatmap } from "@/components/admin/TopicHeatmap";
import { TopicTag } from "@/components/admin/TopicTag";
import { EmptyState } from "@/components/admin/EmptyState";
import { PaginationClient } from "@/components/admin/PaginationClient";
import { SortableHeaderClient } from "@/components/admin/SortableHeader";
import { TOPIC_CATEGORIES, getTopicLabel, type TopicCategory } from "@/lib/admin/topics";
import type { Lang } from "@/lib/i18n/dict";
import type { SortDir } from "@/lib/admin/pagination";
import { tabClass, tabGroupClass } from "@/lib/admin/ui";
import { createTopicAction, deleteTopicAction, updateTopicAction, type TopicFormState } from "./actions";

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
  totalTopics: string;
  hottest: string;
  covered: string;
  showing: string;
  ofTopics: string;
  rows: string;
  page: string;
  newTopic: string;
  editTopic: string;
  slug: string;
  category: string;
  englishLabel: string;
  chineseLabel: string;
  addTopic: string;
  updateTopic: string;
  deleteTopic: string;
  createHint: string;
  deleteBlocked: string;
  actions: string;
  clear: string;
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

const CATEGORY_KEYS = Object.keys(TOPIC_CATEGORIES) as TopicCategory[];

function labelFor(stat: TopicStat, lang: Lang) {
  return stat[lang] ?? getTopicLabel(stat.slug, lang);
}

export function TopicsClient({ stats, labels, lang }: { stats: TopicStat[]; labels: TopicsLabels; lang: Lang }) {
  const [view, setView] = useState<"table" | "heatmap">("table");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TopicCategory>(CATEGORY_KEYS[0]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const editingTopic = editingSlug ? stats.find((s) => s.slug === editingSlug) : null;

  function openNewTopic() {
    setEditingSlug(null);
    setEditorOpen(true);
  }

  function openEditTopic(slug: string) {
    setEditingSlug(slug);
    setEditorOpen(true);
  }

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const key of CATEGORY_KEYS) counts[key] = 0;
    for (const s of stats) {
      if (counts[s.category] !== undefined) counts[s.category]++;
    }
    return counts;
  }, [stats]);

  const filtered = useMemo(() => {
    let list = stats.filter((s) => s.category === activeTab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        s.slug.toLowerCase().includes(q) || labelFor(s, lang).toLowerCase().includes(q),
      );
    }
    return list;
  }, [stats, activeTab, search, lang]);

  const sorted = useMemo(() => {
    const mult = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "slug") return mult * a.slug.localeCompare(b.slug);
      if (sortKey === "total") return mult * (a.total - b.total);
      return mult * ((a.counts[sortKey as keyof typeof a.counts] ?? 0) - (b.counts[sortKey as keyof typeof b.counts] ?? 0));
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    const from = (page - 1) * PAGE_SIZE;
    return sorted.slice(from, from + PAGE_SIZE);
  }, [sorted, page]);

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

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line bg-paper/30">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder={labels.search}
            aria-label={labels.search}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-[13px] text-ink-800 placeholder:text-ink-400 w-48 focus:outline-none focus:ring-1 focus:ring-navy-300"
          />
          <div className={tabGroupClass()}>
            <button
              type="button"
              onClick={() => setView("table")}
              className={tabClass(view === "table", "sm")}
            >
              {labels.table}
            </button>
            <button
              type="button"
              onClick={() => setView("heatmap")}
              className={tabClass(view === "heatmap", "sm")}
            >
              {labels.heatmap}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-5 text-[13px] text-ink-600">
          <button
            type="button"
            onClick={openNewTopic}
            className="rounded-md bg-navy-700 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-navy-50 hover:bg-navy-600 transition-colors"
          >
            + {labels.newTopic}
          </button>
        </div>
      </header>

      {editorOpen && (
        <TopicEditorModal
          key={editingTopic?.slug ?? "new"}
          topic={editingTopic ?? undefined}
          labels={labels}
          lang={lang}
          onClose={() => {
            setEditorOpen(false);
            setEditingSlug(null);
          }}
          onSaved={(category) => {
            setActiveTab(category);
            setPage(1);
          }}
        />
      )}

      {/* Category tabs */}
      <div className="overflow-x-auto scrollbar-none px-5 py-2 border-b border-line bg-paper/30">
        <div className={tabGroupClass()} role="tablist">
          {CATEGORY_KEYS.map((key) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => { setActiveTab(key); setPage(1); }}
                className={tabClass(isActive, "sm")}
              >
                {TOPIC_CATEGORIES[key][lang]}
                <span className="ml-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[9px] text-ink-500 tabular-nums">{categoryCounts[key]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {view === "heatmap" ? (
        <div>
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
        <div>
          <div className="px-5 py-2 border-b border-line bg-paper/30 text-[12px] text-ink-500">
            {labels.showing} <span className="font-semibold text-ink-700">{paginated.length}</span> {labels.ofTopics} <span className="font-semibold text-ink-700">{sorted.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-paper/30">
                  <th className="px-5 py-3">
                    <SortableHeaderClient column="slug" label="Topic" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
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
                  <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
                    {labels.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState title={labels.noTopics} description={labels.noTopicsDesc} compact />
                    </td>
                  </tr>
                )}
                {paginated.map((s) => {
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
                            onEdit={() => openEditTopic(s.slug)}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <TopicTag label={s.slug} lang={lang} displayLabel={labelFor(s, lang)} category={s.category} />
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
                          {(["papers", "conferences", "talents", "opensource"] as const).map((e) => (
                            <td key={e} className="px-5 py-3 text-[13px] tabular-nums text-ink-700">
                              {s.counts[e] || <span className="text-ink-200">—</span>}
                            </td>
                          ))}
                          <td className="px-5 py-3 text-[13px] font-semibold tabular-nums text-ink-800">{s.total}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => openEditTopic(s.slug)}
                                className="font-mono text-[10px] uppercase tracking-[0.14em] text-navy-600 hover:text-navy-800"
                              >
                                {labels.editTopic}
                              </button>
                              <DeleteTopicForm topic={s} labels={labels} />
                            </div>
                          </td>
                        </>
                      )}
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
        </div>
      )}
    </div>
  );
}

function TopicEditorModal({
  topic,
  labels,
  lang,
  onClose,
  onSaved,
}: {
  topic?: TopicStat;
  labels: TopicsLabels;
  lang: Lang;
  onClose: () => void;
  onSaved: (category: TopicCategory) => void;
}) {
  const router = useRouter();
  const action = topic ? updateTopicAction : createTopicAction;
  const [state, formAction, pending] = useActionState<TopicFormState, FormData>(action, undefined);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const inputCls = "w-full rounded-md border border-line bg-surface px-2.5 py-1 text-[12px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-1 focus:ring-navy-300";

  useEffect(() => {
    window.requestAnimationFrame(() => firstInputRef.current?.focus({ preventScroll: true }));
  }, []);

  useEffect(() => {
    if (!state?.success) return;
    if (state.category) onSaved(state.category);
    router.refresh();
    onClose();
  }, [state?.success, state?.category, router, onClose, onSaved]);

  return (
    <DetailModal title={topic ? labelFor(topic, lang) : labels.addTopic} label={topic ? labels.editTopic : labels.newTopic} onClose={onClose}>
      <form action={formAction}>
        <input type="hidden" name="originalSlug" value={topic?.slug ?? ""} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label>
            <span className="tracked-label text-[9px]">{labels.slug}</span>
            <input
              ref={firstInputRef}
              name="slug"
              required
              defaultValue={topic?.slug ?? ""}
              placeholder="network-topic"
              className={`${inputCls} mt-1`}
              readOnly={!!topic && topic.total > 0}
              title={topic && topic.total > 0 ? labels.deleteBlocked : labels.slug}
            />
          </label>
          <label>
            <span className="tracked-label text-[9px]">{labels.category}</span>
            <select name="category" defaultValue={!topic || topic.category === "other" ? "network-systems" : topic.category} className={`${inputCls} mt-1`}>
              {CATEGORY_KEYS.map((key) => (
                <option key={key} value={key}>{TOPIC_CATEGORIES[key][lang]}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="tracked-label text-[9px]">{labels.englishLabel}</span>
            <input name="en" required defaultValue={topic?.en ?? topic?.slug ?? ""} className={`${inputCls} mt-1`} />
          </label>
          <label>
            <span className="tracked-label text-[9px]">{labels.chineseLabel}</span>
            <input name="zh" required defaultValue={topic?.zh ?? topic?.slug ?? ""} className={`${inputCls} mt-1`} />
          </label>
          <div className="sm:col-span-2 min-h-4">
            {state?.error ? (
              <p className="text-[12px] text-rust-700">{state.error}</p>
            ) : (
              <p className="text-[11.5px] text-ink-400">{labels.createHint}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-line pt-4 mt-4">
          <button type="button" onClick={onClose} className="rounded-md border border-line px-3 py-1.5 text-[12px] text-ink-600 hover:bg-paper">
            {labels.clear}
          </button>
          <button type="submit" disabled={pending} className="rounded-md bg-navy-700 px-4 py-1.5 text-[12px] text-navy-50 hover:bg-navy-600 disabled:opacity-60">
            {pending ? "..." : topic ? labels.updateTopic : labels.addTopic}
          </button>
        </div>
      </form>
    </DetailModal>
  );
}

function DeleteTopicForm({ topic, labels }: { topic: TopicStat; labels: TopicsLabels }) {
  const [state, formAction, pending] = useActionState<TopicFormState, FormData>(deleteTopicAction, undefined);
  const disabled = pending || topic.total > 0;

  return (
    <form action={formAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="slug" value={topic.slug} />
      <button
        type="submit"
        disabled={disabled}
        title={topic.total > 0 ? labels.deleteBlocked : labels.deleteTopic}
        onClick={(e) => {
          if (!confirm(labels.deleteTopic)) e.preventDefault();
        }}
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-rust-600 hover:text-rust-800 disabled:cursor-not-allowed disabled:text-ink-300"
      >
        {labels.deleteTopic}
      </button>
      {state?.error && <span className="max-w-40 truncate text-[11px] text-rust-700">{state.error}</span>}
    </form>
  );
}

function DrillDown({
  stat,
  lang,
  labels,
  isDup,
  dupSiblings,
  onCollapse,
  onEdit,
}: {
  stat: TopicStat;
  lang: Lang;
  labels: TopicsLabels;
  isDup: boolean;
  dupSiblings: string[];
  onCollapse: () => void;
  onEdit: () => void;
}) {
  const entities = ["papers", "conferences", "talents", "opensource"] as const;

  return (
    <div className="space-y-3 py-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TopicTag label={stat.slug} lang={lang} displayLabel={labelFor(stat, lang)} category={stat.category} />
          <span className="font-mono text-[11px] text-ink-400 tabular-nums">
            {stat.total} {labels.items}
          </span>
          {isDup && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[9px] text-amber-700">
              {labels.similarTo}: {dupSiblings.join(", ")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-navy-600 hover:text-navy-800"
          >
            {labels.editTopic}
          </button>
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
