import { getTopAuthors, getTopAffiliations, getTopicDistribution } from "@/lib/admin/session-utils";
import { getTopicLabel, getTopicCategory, getCategoryColor, TOPIC_CATEGORIES } from "@/lib/admin/topics";
import type { ConferenceSession } from "@/lib/admin/types";
import type { Lang } from "@/lib/i18n/dict";

type SessionStatsLabels = {
  topAuthors: string;
  topAffiliations: string;
  topicDistribution: string;
  papers: string;
};

const CHART_COLORS = [
  "var(--color-navy-500)",
  "var(--color-cobalt-500)",
  "var(--color-rust-500)",
  "var(--color-moss-500)",
  "var(--color-amber-500)",
  "var(--color-ink-400)",
  "var(--color-navy-300)",
  "var(--color-cobalt-300)",
];

function topicColor(slug: string): string {
  const cat = getTopicCategory(slug);
  if (!cat) return "var(--color-ink-400)";
  const color = getCategoryColor(cat);
  const map: Record<string, string> = {
    navy: "var(--color-navy-500)",
    cobalt: "var(--color-cobalt-500)",
    rust: "var(--color-rust-500)",
    moss: "var(--color-moss-500)",
    amber: "var(--color-amber-500)",
  };
  return map[color] ?? "var(--color-ink-400)";
}

export function SessionStats({ sessions, labels, lang }: { sessions: ConferenceSession[]; labels: SessionStatsLabels; lang: Lang }) {
  if (sessions.length === 0) return null;

  const topAuthors = getTopAuthors(sessions, 5);
  const topAffils = getTopAffiliations(sessions, 5);
  const dist = getTopicDistribution(sessions);
  const maxAuthorCount = topAuthors[0]?.count ?? 1;
  const maxAffilCount = topAffils[0]?.count ?? 1;

  const gradient = dist
    .reduce<{ stops: string[]; offset: number }>((acc, d, i) => {
      const color = topicColor(d.topic) || CHART_COLORS[i % CHART_COLORS.length];
      const end = acc.offset + d.pct;
      acc.stops.push(`${color} ${acc.offset}% ${end}%`);
      acc.offset = end;
      return acc;
    }, { stops: [], offset: 0 }).stops.join(", ");

  return (
    <section className="rounded-lg border border-line bg-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-line bg-paper/30">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          {labels.topicDistribution}
        </p>
      </div>
      <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-line">
        {/* Top Authors */}
        <div className="p-5 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">{labels.topAuthors}</p>
          <div className="space-y-2">
            {topAuthors.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-ink-700 truncate w-20 sm:w-28 shrink-0">{a.name}</span>
                <div className="flex-1 h-4 bg-ink-100 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-navy-500 rounded-sm"
                    style={{ width: `${(a.count / maxAuthorCount) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] tabular-nums text-ink-500 w-6 text-right">{a.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Affiliations */}
        <div className="p-5 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">{labels.topAffiliations}</p>
          <div className="space-y-2">
            {topAffils.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-ink-700 truncate w-20 sm:w-28 shrink-0">{a.name}</span>
                <div className="flex-1 h-4 bg-ink-100 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-cobalt-500 rounded-sm"
                    style={{ width: `${(a.count / maxAffilCount) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] tabular-nums text-ink-500 w-6 text-right">{a.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Distribution */}
        <div className="p-5 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">{labels.topicDistribution}</p>
          <div className="flex items-center gap-5">
            <div
              className="h-24 w-24 shrink-0 rounded-full"
              style={{ background: `conic-gradient(${gradient || "var(--color-ink-200) 0% 100%"})` }}
            />
            <div className="space-y-1.5 min-w-0">
              {dist.slice(0, 6).map((d) => (
                <div key={d.topic} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: topicColor(d.topic) }} />
                  <span className="font-mono text-[10px] text-ink-600 truncate">{getTopicLabel(d.topic, lang)}</span>
                  <span className="font-mono text-[9px] tabular-nums text-ink-400 ml-auto">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
