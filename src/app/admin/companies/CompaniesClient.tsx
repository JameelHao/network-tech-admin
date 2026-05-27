"use client";

import Link from "next/link";
import { useMemo, useState, useCallback } from "react";
import { COMPANY_COLORS, COMPANY_NAMES } from "@/lib/admin/companies";
import type { Lang } from "@/lib/i18n/dict";

type CompanyRow = {
  slug: string;
  name: string;
  color: string;
  paperCount: number;
  newsCount: number;
  repoCount: number;
  latestRepoPush: string | null;
  total: number;
};

function timeAgo(dateStr: string, lang: Lang): string {
  const sec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (sec < 60) return lang === "zh" ? "刚刚" : "now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  if (sec < 2592000) return `${Math.floor(sec / 86400)}d`;
  return new Date(dateStr).toLocaleDateString();
}

export function CompaniesClient({ companies, lang }: { companies: CompanyRow[]; lang: Lang }) {
  const [search, setSearch] = useState("");
  const [syncingAll, setSyncingAll] = useState(false);

  const filtered = useMemo(
    () => search ? companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) : companies,
    [companies, search],
  );

  const handleSyncAll = useCallback(async () => {
    if (!confirm(lang === "zh" ? `同步全部 ${companies.length} 家公司?` : `Sync all ${companies.length} companies?`)) return;
    setSyncingAll(true);
    try {
      const res = await fetch("/api/sync/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (data.error) {
        alert(lang === "zh" ? `同步失败: ${data.error}` : `Sync failed: ${data.error}`);
      } else {
        const total = Object.values(data.results ?? {}).reduce((s: number, r: any) => s + (r?.inserted ?? 0), 0);
        alert(lang === "zh" ? `全部同步完成: ${total} repos` : `All synced: ${total} repos`);
      }
      window.location.reload();
    } catch {
      alert(lang === "zh" ? "同步请求失败" : "Sync request failed");
    } finally {
      setSyncingAll(false);
    }
  }, [companies.length, lang]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === "zh" ? "搜索公司..." : "Search companies..."}
          className="rounded-lg border border-line bg-surface px-4 py-2.5 text-[13px] text-ink-700 w-full sm:w-64"
        />
        <button
          onClick={handleSyncAll}
          disabled={syncingAll}
          className="rounded-md border border-line bg-surface px-4 py-2.5 text-[12px] font-mono text-ink-600 hover:bg-paper/40 transition-colors disabled:opacity-50"
        >
          {syncingAll ? (lang === "zh" ? "同步中..." : "Syncing...") : (lang === "zh" ? "同步全部" : "Sync All")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((c) => (
          <Link
            key={c.slug}
            href={`/admin/companies/${c.slug}`}
            className="rounded-lg border border-line bg-surface p-5 hover:shadow-sm hover:border-ink-300 transition-all block"
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${c.color}`}>
                {c.name}
              </span>
            </div>
            <div className="flex gap-4 text-[12px] text-ink-500 font-mono tabular-nums">
              <span>{c.paperCount} papers</span>
              <span>{c.newsCount} news</span>
              <span>{c.repoCount} repos</span>
            </div>
            {c.latestRepoPush && (
              <p className="text-[10px] text-ink-300 font-mono mt-2">
                {lang === "zh" ? "最新: " : "latest: "}{timeAgo(c.latestRepoPush, lang)}
              </p>
            )}
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-[13px] text-ink-400 py-8 text-center">
          {lang === "zh" ? "没有匹配的公司" : "No companies match your search"}
        </p>
      )}
    </div>
  );
}
