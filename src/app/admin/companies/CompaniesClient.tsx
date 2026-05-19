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
  patentCount: number;
  total: number;
};

export function CompaniesClient({ companies, lang }: { companies: CompanyRow[]; lang: Lang }) {
  const [search, setSearch] = useState("");
  const [importSlug, setImportSlug] = useState<string | null>(null);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const filtered = useMemo(
    () => search ? companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) : companies,
    [companies, search],
  );

  const handleImport = useCallback(async () => {
    if (!importSlug || !importText.trim()) return;
    setImporting(true);
    setImportMsg(null);
    const numbers = importText.split("\n").map((s) => s.trim()).filter(Boolean);
    try {
      const res = await fetch("/api/sync/patents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: importSlug, numbers }),
      });
      const data = await res.json();
      if (data.error) {
        setImportMsg(lang === "zh" ? `导入失败: ${data.error}` : `Import failed: ${data.error}`);
      } else {
        setImportMsg(lang === "zh" ? `导入 ${data.inserted} 条，${data.duplicates} 条已存在` : `Imported ${data.inserted}, ${data.duplicates} already exist`);
      }
      setImportText("");
      setImportSlug(null);
      setTimeout(() => setImportMsg(null), 5000);
      window.location.reload();
    } catch (e) {
      setImportMsg(lang === "zh" ? "导入失败" : `Import failed: ${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setImporting(false);
    }
  }, [importSlug, importText, lang]);

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
      </div>

      {/* Import dialog */}
      {importSlug && (
        <div className="rounded-lg border border-line bg-surface p-4 space-y-3">
          <p className="text-[13px] font-medium text-ink-800">
            {lang === "zh" ? `导入 ${COMPANY_NAMES[importSlug] ?? importSlug} 的专利` : `Import patents for ${COMPANY_NAMES[importSlug] ?? importSlug}`}
          </p>
          <p className="text-[11px] text-ink-500">
            {lang === "zh"
              ? "在 Google Patents 搜索后，每行粘贴一个专利号（如 US20260073310A1）"
              : "Search on Google Patents, then paste one patent number per line (e.g. US20260073310A1)"}
          </p>
          <a
            href={`https://patents.google.com/?q=assignee:${encodeURIComponent(COMPANY_NAMES[importSlug] ?? importSlug)}&sort=new`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[12px] font-mono text-navy-500 hover:text-navy-700"
          >
            {lang === "zh" ? "打开 Google Patents 搜索" : "Open Google Patents search"} &rarr;
          </a>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={5}
            placeholder={lang === "zh" ? "每行一个专利号..." : "One patent number per line..."}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-[12px] text-ink-700 font-mono"
          />
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              disabled={importing || !importText.trim()}
              className="rounded-md bg-navy-600 px-4 py-2 text-[12px] font-mono text-white hover:bg-navy-700 transition-colors disabled:opacity-50"
            >
              {importing ? (lang === "zh" ? "导入中..." : "Importing...") : (lang === "zh" ? "导入" : "Import")}
            </button>
            <button
              onClick={() => { setImportSlug(null); setImportText(""); }}
              className="rounded-md border border-line bg-surface px-4 py-2 text-[12px] font-mono text-ink-600 hover:bg-paper/40 transition-colors"
            >
              {lang === "zh" ? "取消" : "Cancel"}
            </button>
            {importMsg && <span className="text-[12px] text-ink-500 font-mono self-center">{importMsg}</span>}
          </div>
        </div>
      )}

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
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setImportSlug(c.slug);
                  setImportText("");
                  setImportMsg(null);
                }}
                className="text-[10px] font-mono text-ink-400 hover:text-navy-500 transition-colors"
              >
                + patent
              </button>
            </div>
            <div className="flex gap-4 text-[12px] text-ink-500 font-mono tabular-nums">
              <span>{c.paperCount} papers</span>
              <span>{c.newsCount} news</span>
              <span>{c.patentCount} patents</span>
            </div>
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
