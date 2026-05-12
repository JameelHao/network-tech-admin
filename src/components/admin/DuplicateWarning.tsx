"use client";

import { useState } from "react";
import Link from "next/link";
import type { DuplicateGroup } from "@/lib/admin/paper-dedup";

const STORAGE_KEY = "nta-dedup-ignored";

type DedupLabels = {
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

function getIgnored(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveIgnored(keys: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...keys]));
}

const REASON_KEY: Record<DuplicateGroup["reason"], keyof Pick<DedupLabels, "exactTitle" | "similarTitle" | "sameAuthorsSimilarTitle">> = {
  "exact-title": "exactTitle",
  "similar-title": "similarTitle",
  "same-authors-similar-title": "sameAuthorsSimilarTitle",
};

export function DuplicateWarning({
  groups,
  labels,
}: {
  groups: DuplicateGroup[];
  labels: DedupLabels;
}) {
  const [ignored, setIgnoredState] = useState(getIgnored);
  const [expanded, setExpanded] = useState(false);

  const visible = groups.filter((g) => !ignored.has(g.key));
  if (visible.length === 0) return null;

  function ignore(key: string) {
    const next = new Set(ignored);
    next.add(key);
    setIgnoredState(next);
    saveIgnored(next);
  }

  function resetAll() {
    setIgnoredState(new Set());
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50/60">
      <div className="flex items-center justify-between px-5 py-2.5">
        <div className="flex items-center gap-2 text-[13px] text-amber-800">
          <svg viewBox="0 0 16 16" className="h-4 w-4 text-amber-500 shrink-0" fill="currentColor">
            <path d="M8 1a1 1 0 0 1 .87.5l6.5 11.25A1 1 0 0 1 14.5 14h-13a1 1 0 0 1-.87-1.25L7.13 1.5A1 1 0 0 1 8 1zM7.25 6v3.5h1.5V6h-1.5zM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
          </svg>
          <span>
            {labels.warning} — <strong>{visible.length}</strong> {labels.groupsFound}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-700 hover:text-amber-900 transition-colors"
        >
          {expanded ? labels.hide : labels.viewDetails}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-amber-200 px-5 py-3 space-y-3">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={resetAll}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 hover:text-ink-800 transition-colors"
            >
              {labels.reset}
            </button>
          </div>
          {visible.map((group) => (
            <div key={group.key} className="rounded-md border border-amber-200 bg-white/60 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[9px] text-amber-700">
                    {labels[REASON_KEY[group.reason]]}
                  </span>
                  <span className="font-mono text-[11px] text-ink-500">
                    {labels.similarity}: {group.similarity}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => ignore(group.key)}
                  className="rounded-md border border-line px-2 py-0.5 font-mono text-[10px] text-ink-500 hover:text-ink-800 hover:bg-paper/60 transition-colors"
                >
                  {labels.ignore}
                </button>
              </div>
              <ul className="space-y-1.5">
                {group.papers.map((p) => (
                  <li key={p.id} className="flex items-start gap-2">
                    <Link
                      href={`/admin/papers/${p.id}`}
                      className="text-[12px] text-navy-600 hover:text-navy-800 hover:underline flex-1 truncate"
                    >
                      {p.title}
                    </Link>
                    <span className="text-[11px] text-ink-400 shrink-0">
                      {p.authors.slice(0, 3).join(", ")}
                      {p.authors.length > 3 ? ` +${p.authors.length - 3}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
