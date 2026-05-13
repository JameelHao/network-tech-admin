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
  syncResult?: string;
  sourcesFailed?: string;
};

type SyncData = { lastSync: string | null; count: number };

type SyncResultInfo = {
  news?: number;
  jobs?: number;
  imported?: number;
  updated?: number;
  checked?: number;
  feedStats?: { source: string; status: string; count: number; error?: string }[];
  categoryStats?: { category: string; status: string; count: number; error?: string }[];
  stats?: { name: string; status: string; version?: string; error?: string }[];
};

const SYNC_ENDPOINTS: Record<string, string> = {
  papers: "/api/sync/papers",
  news: "/api/sync/feeds",
  jobs: "/api/sync/feeds",
  products: "/api/sync/products",
  opensource: "/api/sync/opensource",
};

export function SyncStatusBar({
  entity,
  labels,
  lang,
}: {
  entity: "papers" | "news" | "jobs" | "products" | "opensource";
  labels: SyncLabels;
  lang: Lang;
}) {
  const [data, setData] = useState<SyncData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResultInfo | null>(null);

  const fetchStatus = useCallback(() => {
    fetch("/api/sync-status")
      .then((r) => r.json())
      .then((json) => setData(json[entity] ?? null))
      .catch(() => {});
  }, [entity]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  useEffect(() => {
    if (!syncResult) return;
    const resultStats = syncResult.feedStats ?? syncResult.categoryStats ?? syncResult.stats ?? [];
    const failedCount = resultStats.filter((s) => s.status === "error").length;
    if (failedCount === resultStats.length) return;
    const timer = setTimeout(() => setSyncResult(null), 5000);
    return () => clearTimeout(timer);
  }, [syncResult]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setSyncResult(null);
    try {
      const res = await fetch(SYNC_ENDPOINTS[entity], { method: "POST" });
      const json = await res.json();
      if (json.feedStats || json.categoryStats || json.stats) setSyncResult(json);
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

  const productStats = syncResult?.stats?.map((s) => ({ source: s.name, status: s.status, count: s.version ? 1 : 0, error: s.error }));
  const allStats = syncResult?.feedStats ?? syncResult?.categoryStats ?? productStats ?? [];
  const failedFeeds = allStats.filter((s) => s.status === "error");
  const totalItems = syncResult
    ? (syncResult.updated ?? syncResult.imported ?? ((syncResult.news ?? 0) + (syncResult.jobs ?? 0)))
    : 0;
  const allFailed = syncResult && allStats.length > 0 && failedFeeds.length === allStats.length;

  return (
    <div className="mb-4 space-y-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-line bg-surface px-4 py-2.5">
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

      {syncResult && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-[12px] ${
          allFailed
            ? "border-red-200 bg-red-50 text-red-700"
            : failedFeeds.length > 0
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}>
          <span className="font-semibold">
            {labels.syncResult ?? "Sync"}: {totalItems} {syncResult?.imported !== undefined ? (lang === "zh" ? "篇导入" : "imported") : (lang === "zh" ? "条" : "items")}
          </span>
          {failedFeeds.length > 0 && (
            <span>
              · {failedFeeds.length} {labels.sourcesFailed ?? (lang === "zh" ? "个源失败" : "sources failed")}
              <span className="text-[11px] ml-1 opacity-70">
                ({failedFeeds.map((f) => ("source" in f ? f.source : (f as { category: string }).category)).join(", ")})
              </span>
            </span>
          )}
          {!allFailed && (
            <button
              type="button"
              onClick={() => setSyncResult(null)}
              className="ml-auto text-[10px] opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
