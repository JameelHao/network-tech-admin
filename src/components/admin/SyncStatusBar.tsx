"use client";

import { useEffect, useState, useCallback } from "react";
import { getFreshness, freshnessLabel } from "@/lib/admin/freshness";
import { relativeTime } from "@/lib/admin/format";
import type { Lang } from "@/lib/i18n/dict";

type SyncLabels = {
  lastSync: string;
  refresh: string;
  refreshing: string;
  noData: string;
};

type SyncData = { lastSync: string | null; count: number };

const SYNC_ENDPOINTS: Record<string, string> = {
  papers: "/api/sync/papers",
  news: "/api/sync/feeds",
  jobs: "/api/sync/feeds",
};

export function SyncStatusBar({
  entity,
  labels,
  lang,
}: {
  entity: "papers" | "news" | "jobs";
  labels: SyncLabels;
  lang: Lang;
}) {
  const [data, setData] = useState<SyncData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = useCallback(() => {
    fetch("/api/sync-status")
      .then((r) => r.json())
      .then((json) => setData(json[entity] ?? null))
      .catch(() => {});
  }, [entity]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch(SYNC_ENDPOINTS[entity], { method: "POST" });
      fetchStatus();
    } finally {
      setRefreshing(false);
    }
  };

  if (!data) return null;

  const freshness = getFreshness(data.lastSync);
  const fLabel = freshnessLabel(freshness.level, lang);
  const timeStr = data.lastSync ? relativeTime(data.lastSync, lang) : null;
  const dateStr = data.lastSync
    ? new Date(data.lastSync).toLocaleString(lang === "zh" ? "zh-CN" : "en-US", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-line bg-surface px-4 py-2.5 mb-4">
      <span className={`inline-block h-2 w-2 rounded-full ${freshness.dotClass}`} />
      <span className={`font-mono text-[11px] ${freshness.color}`}>{fLabel}</span>
      {timeStr ? (
        <span className="text-[12px] text-ink-500">
          {labels.lastSync}: {timeStr}
          {dateStr && <span className="text-ink-400 ml-1">({dateStr})</span>}
        </span>
      ) : (
        <span className="text-[12px] text-ink-400">{labels.noData}</span>
      )}
      <button
        type="button"
        onClick={handleRefresh}
        disabled={refreshing}
        className="ml-auto rounded-md border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-600 hover:text-ink-800 hover:border-line-strong transition-colors disabled:opacity-50"
      >
        {refreshing ? labels.refreshing : labels.refresh}
      </button>
    </div>
  );
}
