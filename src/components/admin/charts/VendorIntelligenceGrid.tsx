import { TopicTag } from "@/components/admin/TopicTag";
import type { Lang } from "@/lib/i18n/dict";
import Link from "next/link";

type VendorSummary = {
  id: string;
  name: string;
  topics: string[];
  ai_insights: Record<string, any>;
  paper_count: number;
  product_count: number;
  news_count: number;
};

const NAME_TO_SLUG: Record<string, string> = {
  "Cisco": "cisco", "Google": "google", "Ericsson": "ericsson", "Nokia": "nokia",
  "AWS": "aws", "Microsoft": "microsoft", "OpenAI": "openai", "NVIDIA": "nvidia",
  "Meta": "meta", "Micron": "micron", "Broadcom": "broadcom", "Intel": "intel",
  "IBM": "ibm", "Huawei": "huawei", "Cloudflare": "cloudflare", "Apple": "apple",
  "AMD": "amd", "Tencent": "tencent", "Alibaba": "alibaba", "Baidu": "baidu",
  "ByteDance": "bytedance",
};

function ActivityDot({ level }: { level: string }) {
  const colors: Record<string, string> = {
    high: "bg-emerald-500",
    medium: "bg-amber-500",
    low: "bg-ink-300",
  };
  return <span className={`w-2 h-2 rounded-full inline-block ${colors[level] ?? "bg-ink-300"}`} />;
}

export function VendorIntelligenceGrid({ data, lang }: { data: VendorSummary[]; lang: Lang }) {
  if (data.length === 0) {
    return <p className="text-[13px] text-ink-400 py-8 text-center">No vendor data</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((v) => {
        const ai = v.ai_insights ?? {};
        const activity = ai.activity_level ?? "medium";
        const strengths: string[] = ai.strengths ?? [];
        const focusAreas: string[] = ai.focus_areas ?? [];
        const position: string = ai.technology_position ?? "";
        const slug = NAME_TO_SLUG[v.name] ?? "";

        return (
          <Link
            key={v.id}
            href={slug ? `/admin/companies/${slug}` : `/admin`}
            className="rounded-lg border border-line bg-surface p-4 hover:shadow-sm transition-shadow block"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ActivityDot level={activity} />
                <h4 className="text-[14px] font-semibold text-ink-800">{v.name}</h4>
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
                  {strengths.map((s, i) => (
                    <span key={i} className="text-[10px] font-mono bg-moss-50 text-moss-700 px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {focusAreas.length > 0 && (
              <div className="mb-2">
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-400 mb-1">Focus</p>
                <div className="flex flex-wrap gap-1">
                  {focusAreas.map((s, i) => (
                    <span key={i} className="text-[10px] font-mono bg-navy-50 text-navy-700 px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-1 mt-1">
              {v.topics.slice(0, 6).map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}
            </div>

            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-line">
              <span className="text-[10px] font-mono text-ink-400">{v.paper_count} papers</span>
              <span className="text-[10px] font-mono text-ink-400">{v.product_count} products</span>
              <span className="text-[10px] font-mono text-ink-400">{v.news_count} news</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
