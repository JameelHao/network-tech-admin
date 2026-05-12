"use client";

import type { TopicStat } from "@/lib/admin/topic-aggregator";
import { getTopicLabel } from "@/lib/admin/topics";
import type { Lang } from "@/lib/i18n/dict";

const ENTITIES = ["papers", "conferences", "talents", "opensource"] as const;

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
      <div
        className="grid gap-px bg-line min-w-[480px]"
        style={{ gridTemplateColumns: `180px repeat(${ENTITIES.length}, 1fr)` }}
      >
        <div className="bg-paper px-3 py-2" />
        {ENTITIES.map((e) => (
          <div key={e} className="bg-paper px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500 text-center">
            {entityLabels[e]}
          </div>
        ))}

        {stats.map((s) => (
          <div key={s.slug} className="contents">
            <div className="bg-surface px-3 py-2 text-[12px] text-ink-700 truncate">
              {getTopicLabel(s.slug, lang)}
            </div>
            {ENTITIES.map((e) => {
              const count = s.counts[e];
              const intensity = count / maxCount;
              return (
                <div
                  key={e}
                  className="bg-surface flex items-center justify-center py-2 text-[11px] tabular-nums"
                  style={{
                    backgroundColor: count > 0 ? `rgba(30, 64, 175, ${0.08 + intensity * 0.52})` : undefined,
                    color: intensity > 0.4 ? "#fff" : undefined,
                  }}
                >
                  {count > 0 ? count : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
