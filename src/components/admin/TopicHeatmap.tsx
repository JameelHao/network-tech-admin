"use client";

import type { TopicStat } from "@/lib/admin/topic-aggregator";
import { getTopicLabel } from "@/lib/admin/topics";
import { HEATMAP_SCALE, getHeatColor } from "@/lib/admin/chart-theme";
import type { Lang } from "@/lib/i18n/dict";

const ENTITIES = ["papers", "conferences", "opensource"] as const;

function topicLabel(stat: TopicStat, lang: Lang) {
  return stat[lang] ?? getTopicLabel(stat.slug, lang);
}

export function TopicHeatmap({
  stats,
  lang,
  entityLabels,
}: {
  stats: TopicStat[];
  lang: Lang;
  entityLabels: Record<string, string>;
}) {
  const maxCount = Math.max(1, ...stats.flatMap((s) => ENTITIES.map((e) => s.counts[e])));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[480px]">
        <div
          className="grid gap-px"
          style={{ gridTemplateColumns: `180px repeat(${ENTITIES.length}, 1fr)` }}
        >
          <div />
          {ENTITIES.map((e) => (
            <div
              key={e}
              className="text-center font-mono text-[9px] text-ink-400 pb-1 truncate"
            >
              {entityLabels[e]}
            </div>
          ))}

          {stats.map((s) => (
            <div key={s.slug} className="contents">
              <div
                className="text-right pr-2 font-mono text-[10px] text-ink-500 truncate leading-7"
                title={topicLabel(s, lang)}
              >
                {topicLabel(s, lang)}
              </div>
              {ENTITIES.map((e) => {
                const count = s.counts[e];
                const ratio = count / maxCount;
                return (
                  <div
                    key={e}
                    className="h-7 rounded-sm transition-all duration-150 hover:scale-110 hover:shadow-md hover:z-10 relative group cursor-default"
                    style={{ backgroundColor: count > 0 ? getHeatColor(ratio) : undefined }}
                  >
                    {count > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] tabular-nums text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-1 mt-3 px-2">
          <span className="font-mono text-[9px] text-ink-400 mr-0.5">Less</span>
          {HEATMAP_SCALE.map((color, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: color }} />
          ))}
          <span className="font-mono text-[9px] text-ink-400 ml-0.5">More</span>
        </div>
      </div>
    </div>
  );
}
