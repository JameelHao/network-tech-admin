"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

function mdToHtml(md: string): React.ReactNode[] {
  const lines = md.split("\n");
  const nodes: React.ReactNode[] = [];
  let inList: "ul" | "ol" | null = null;
  let listItems: React.ReactNode[] = [];
  let key = 0;

  function flushList() {
    if (inList && listItems.length > 0) {
      const Tag = inList === "ul" ? "ul" : "ol";
      nodes.push(<Tag key={key++} className="space-y-1 my-3">{listItems}</Tag>);
      listItems = [];
      inList = null;
    }
  }

  function inline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let i = 0;
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
      if (boldMatch) {
        parts.push(<strong key={i++}>{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }
      const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/);
      if (linkMatch) {
        parts.push(
          <a key={i++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
            className="text-navy-600 hover:text-navy-800 underline underline-offset-2">
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }
      const next = remaining.search(/[*\[]/);
      if (next === 0) { parts.push(remaining[0]); remaining = remaining.slice(1); }
      else if (next > 0) { parts.push(remaining.slice(0, next)); remaining = remaining.slice(next); }
      else { parts.push(remaining); remaining = ""; }
    }
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) { flushList(); continue; }
    if (trimmed.startsWith("---")) { flushList(); nodes.push(<hr key={key++} className="my-6 border-line" />); continue; }
    if (trimmed.startsWith("# ")) { flushList(); nodes.push(<h1 key={key++} className="text-[22px] font-bold text-ink-900 mt-8 mb-4">{inline(trimmed.slice(2))}</h1>); continue; }
    if (trimmed.startsWith("## ")) { flushList(); nodes.push(<h2 key={key++} className="text-[17px] font-semibold text-ink-800 mt-6 mb-3">{inline(trimmed.slice(3))}</h2>); continue; }
    if (trimmed.startsWith("### ")) { flushList(); nodes.push(<h3 key={key++} className="text-[14px] font-semibold text-ink-700 mt-4 mb-2">{inline(trimmed.slice(4))}</h3>); continue; }
    if (trimmed.startsWith("- ")) { if (inList !== "ul") flushList(); inList = "ul"; listItems.push(<li key={key++} className="text-[13px] text-ink-700 leading-relaxed pl-1">{inline(trimmed.slice(2))}</li>); continue; }
    if (/^\d+\.\s/.test(trimmed)) { if (inList !== "ol") flushList(); inList = "ol"; listItems.push(<li key={key++} className="text-[13px] text-ink-700 leading-relaxed pl-1">{inline(trimmed.replace(/^\d+\.\s*/, ""))}</li>); continue; }
    if (trimmed.startsWith("> ")) { flushList(); nodes.push(<blockquote key={key++} className="border-l-3 border-navy-300 bg-navy-50/40 pl-4 py-2 my-3 text-[13px] text-ink-600 italic leading-relaxed">{inline(trimmed.slice(2))}</blockquote>); continue; }
    flushList();
    nodes.push(<p key={key++} className="text-[13px] text-ink-700 leading-relaxed my-2">{inline(trimmed)}</p>);
  }
  flushList();
  return nodes;
}

type Props = { lang: string };

export function WeeklyClient({ lang }: Props) {
  const [reports, setReports] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weekly").then(r => r.json()).then(data => {
      const list = data.reports ?? [];
      setReports(list);
      if (list.length > 0) setDate(list[0]);
    });
  }, []);

  const fetchReport = useCallback(async (d: string) => {
    if (!d) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/weekly?date=${d}`);
      const data = await res.json();
      if (data.content) setContent(data.content);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (date) fetchReport(date); }, [date, fetchReport]);

  const rendered = useMemo(() => content ? mdToHtml(content) : [], [content]);

  const formatLabel = (d: string) => `Week ending ${d}`;

  if (!reports.length) {
    return (
      <div className="rounded-lg border border-line bg-surface p-10 text-center">
        <p className="text-[14px] text-ink-500">No reports generated yet.</p>
        <p className="text-[12px] text-ink-400 mt-2">Run the weekly report CLI first.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar — report list */}
      <aside className="w-[200px] shrink-0">
        <div className="space-y-1">
          {reports.map((d) => {
            const active = d === date;
            return (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`w-full text-left px-3 py-2 rounded-md text-[13px] transition-colors ${
                  active
                    ? "bg-navy-100 text-navy-900 font-medium"
                    : "text-ink-600 hover:bg-navy-50 hover:text-ink-900"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
            {lang === "zh" ? "技术情报周报" : "Weekly Tech Intelligence Report"}
          </h1>
          <span className="font-mono text-[11px] text-ink-400">{formatLabel(date)}</span>
        </div>

        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">
              <p className="text-[13px] text-ink-400">{lang === "zh" ? "加载中..." : "Loading..."}</p>
            </div>
          ) : (
            <div className="px-6 sm:px-8 py-6 sm:py-8 max-w-none prose-custom">
              {rendered}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
