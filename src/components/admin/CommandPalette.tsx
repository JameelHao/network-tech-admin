"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import type { SearchableItem, EntityType } from "@/lib/admin/command-search";
import { filterItems, groupByType } from "@/lib/admin/command-search";

const MAX_PER_GROUP = 5;

const TYPE_ORDER: EntityType[] = [
  "conference",
  "paper",
  "lead",
  "talent",
  "news",
  "opensource",
];

type Labels = {
  searchPlaceholder: string;
  quickActions: string;
  noResults: string;
  viewAll: string;
  goToConferences: string;
  goToPapers: string;
  goToLeads: string;
  goToTalents: string;
  goToNews: string;
  goToOpenSource: string;
  goToInsights: string;
  conferences: string;
  papers: string;
  leads: string;
  talents: string;
  news: string;
  opensource: string;
};

const LIST_HREF: Record<EntityType, string> = {
  conference: "/admin/conferences",
  paper: "/admin/papers",
  lead: "/admin/leads",
  talent: "/admin/talents",
  news: "/admin/news",
  opensource: "/admin/opensource",
};

export function CommandPalette({
  items,
  labels,
}: {
  items: SearchableItem[];
  labels: Labels;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => filterItems(items, query), [items, query]);
  const grouped = useMemo(() => groupByType(filtered), [filtered]);

  const navigate = useCallback(
    (href: string, external?: boolean) => {
      setOpen(false);
      setQuery("");
      if (external) {
        window.open(href, "_blank", "noopener");
      } else {
        router.push(href);
      }
    },
    [router],
  );

  const groupLabel: Record<EntityType, string> = {
    conference: labels.conferences,
    paper: labels.papers,
    lead: labels.leads,
    talent: labels.talents,
    news: labels.news,
    opensource: labels.opensource,
  };

  const hasResults = filtered.length > 0;
  const showQuickActions = !query.trim();

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
      label="Command Palette"
      className="fixed inset-0 z-50"
    >
      <div
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="fixed left-1/2 top-[min(20vh,120px)] -translate-x-1/2 w-[min(90vw,560px)] rounded-xl border border-line bg-surface shadow-2xl overflow-hidden">
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder={labels.searchPlaceholder}
          className="w-full border-b border-line bg-transparent px-4 py-3 text-sm text-ink-800 placeholder:text-ink-400 outline-none"
        />
        <Command.List className="max-h-[min(60vh,400px)] overflow-y-auto p-2">
          {!showQuickActions && !hasResults && (
            <Command.Empty className="px-4 py-8 text-center text-sm text-ink-400">
              {labels.noResults}
            </Command.Empty>
          )}

          {showQuickActions && (
            <Command.Group
              heading={labels.quickActions}
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-ink-400"
            >
              <QuickAction label={labels.goToConferences} onSelect={() => navigate("/admin/conferences")} />
              <QuickAction label={labels.goToPapers} onSelect={() => navigate("/admin/papers")} />
              <QuickAction label={labels.goToLeads} onSelect={() => navigate("/admin/leads")} />
              <QuickAction label={labels.goToTalents} onSelect={() => navigate("/admin/talents")} />
              <QuickAction label={labels.goToNews} onSelect={() => navigate("/admin/news")} />
              <QuickAction label={labels.goToOpenSource} onSelect={() => navigate("/admin/opensource")} />
              <QuickAction label={labels.goToInsights} onSelect={() => navigate("/admin/insights")} />
            </Command.Group>
          )}

          {TYPE_ORDER.map((type) => {
            const groupItems = grouped.get(type);
            if (!groupItems || groupItems.length === 0) return null;
            const shown = groupItems.slice(0, MAX_PER_GROUP);
            const hasMore = groupItems.length > MAX_PER_GROUP;

            return (
              <Command.Group
                key={type}
                heading={`${groupLabel[type]} (${groupItems.length})`}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-ink-400"
              >
                {shown.map((item) => (
                  <Command.Item
                    key={`${item.type}-${item.id}`}
                    value={`${item.title} ${item.subtitle}`}
                    onSelect={() => navigate(item.href, item.external)}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm cursor-pointer select-none aria-selected:bg-navy-50 dark:aria-selected:bg-navy-900/30 transition-colors"
                  >
                    <TypeIcon type={item.type} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-ink-800 font-medium text-[13px]">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="truncate text-ink-400 text-[11px]">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    {item.external && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0 text-ink-300">
                        <path d="M3.5 1.5h7v7M10.5 1.5L1.5 10.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    )}
                  </Command.Item>
                ))}
                {hasMore && (
                  <Command.Item
                    value={`view all ${type}`}
                    onSelect={() => navigate(`${LIST_HREF[type]}?q=${encodeURIComponent(query)}`)}
                    className="rounded-md px-2 py-1.5 text-[11px] text-navy-500 hover:text-navy-700 cursor-pointer select-none aria-selected:bg-navy-50 dark:aria-selected:bg-navy-900/30 transition-colors"
                  >
                    {labels.viewAll} →
                  </Command.Item>
                )}
              </Command.Group>
            );
          })}
        </Command.List>
        <div className="border-t border-line px-4 py-2 flex items-center gap-4 text-[10px] text-ink-400 font-mono">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </Command.Dialog>
  );
}

function QuickAction({ label, onSelect }: { label: string; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm cursor-pointer select-none aria-selected:bg-navy-50 dark:aria-selected:bg-navy-900/30 transition-colors"
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-ink-400">
        <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[13px] text-ink-700">{label}</span>
    </Command.Item>
  );
}

function TypeIcon({ type }: { type: EntityType }) {
  const cls = "h-4 w-4 shrink-0 text-ink-400";
  switch (type) {
    case "conference":
      return (
        <svg viewBox="0 0 16 16" className={cls} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <rect x="2" y="3" width="12" height="11" rx="1.5" />
          <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
        </svg>
      );
    case "paper":
      return (
        <svg viewBox="0 0 16 16" className={cls} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <path d="M4 1.5h6l3 3v10H4z" />
          <path d="M10 1.5v3h3M6 8h5M6 10.5h3" />
        </svg>
      );
    case "lead":
      return (
        <svg viewBox="0 0 16 16" className={cls} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 5v3l2 1.5" />
        </svg>
      );
    case "talent":
      return (
        <svg viewBox="0 0 16 16" className={cls} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <circle cx="8" cy="5.5" r="2.5" />
          <path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" />
        </svg>
      );
    case "news":
      return (
        <svg viewBox="0 0 16 16" className={cls} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
          <path d="M4 6h8M4 8.5h5M4 11h6" />
        </svg>
      );
    case "opensource":
      return (
        <svg viewBox="0 0 16 16" className={cls} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 1.5L1.5 8l4.5 6.5M10 1.5l4.5 6.5-4.5 6.5" />
        </svg>
      );
  }
}
