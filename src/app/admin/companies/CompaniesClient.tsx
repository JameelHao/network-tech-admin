"use client";

import Link from "next/link";
import { TopicTag } from "@/components/admin/TopicTag";
import type { Lang } from "@/lib/i18n/dict";

type CompanyRow = {
  slug: string;
  name: string;
  topics: string[];
  aiInsights: Record<string, any> | null;
  paperCount: number;
  newsCount: number;
  repoCount: number;
  total: number;
};

function ActivityDot({ level }: { level: string }) {
  const colors: Record<string, string> = {
    high: "bg-emerald-500",
    medium: "bg-amber-500",
    low: "bg-ink-300",
  };
  return <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${colors[level] ?? "bg-ink-300"}`} />;
}

export function CompaniesClient({ companies, lang }: { companies: CompanyRow[]; lang: Lang }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => {
          const ai = c.aiInsights ?? {};
          const activity = ai.activity_level ?? "medium";
          const strengths: string[] = ai.strengths ?? [];
          const focusAreas: string[] = ai.focus_areas ?? [];
          const position: string = ai.technology_position ?? "";

          return (
            <Link
              key={c.slug}
              href={`/admin/companies/${c.slug}`}
              className="rounded-lg border border-line bg-surface p-4 hover:shadow-sm transition-shadow block"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ActivityDot level={activity} />
                  <h4 className="text-[14px] font-semibold text-ink-800">{c.name}</h4>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-400 bg-ink-50 px-1.5 py-0.5 rounded">
                  {activity}
                </span>
              </div>

              {position && (
                <p className="text-[11.5px] text-ink-600 leading-relaxed mb-2 line-clamp-2">{position}</p>
              )}

              {strengths.length > 0 && (
                <div className="mb-2">
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-400 mb-1">Strengths</p>
                  <div className="flex flex-wrap gap-1">
                    {strengths.map((s: string, i: number) => (
                      <span key={i} className="text-[10px] font-mono bg-moss-50 text-moss-700 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {focusAreas.length > 0 && (
                <div className="mb-2">
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-400 mb-1">Focus</p>
                  <div className="flex flex-wrap gap-1">
                    {focusAreas.map((s: string, i: number) => (
                      <span key={i} className="text-[10px] font-mono bg-navy-50 text-navy-700 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {c.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {c.topics.slice(0, 6).map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}
                </div>
              )}

              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-line text-[10px] font-mono text-ink-400">
                <span>{c.paperCount} papers</span>
                <span>{c.newsCount} news</span>
                <span>{c.repoCount} repos</span>
              </div>
            </Link>
          );
        })}
      </div>

      {companies.length === 0 && (
        <p className="text-[13px] text-ink-400 py-8 text-center">
          {lang === "zh" ? "暂无公司数据" : "No companies"}
        </p>
      )}
    </div>
  );
}
