"use client";

import { getTopAuthors, getTopAffiliations, getTopicDistribution } from "@/lib/admin/session-utils";
import { getTopicLabel } from "@/lib/admin/topics";
import { MiniBar } from "@/components/admin/charts/MiniBar";
import { MiniPie } from "@/components/admin/charts/MiniPie";
import { CHART_COLORS } from "@/lib/admin/chart-theme";
import type { ChartPoint } from "@/lib/admin/insights";
import type { ConferenceSession } from "@/lib/admin/types";
import type { Lang } from "@/lib/i18n/dict";

type SessionStatsLabels = {
  topAuthors: string;
  topAffiliations: string;
  topicDistribution: string;
  papers: string;
};

export function SessionStats({ sessions, labels, lang }: { sessions: ConferenceSession[]; labels: SessionStatsLabels; lang: Lang }) {
  if (sessions.length === 0) return null;

  const topAuthors = getTopAuthors(sessions, 5);
  const topAffils = getTopAffiliations(sessions, 5);
  const dist = getTopicDistribution(sessions);

  const authorData: ChartPoint[] = topAuthors.map((a) => ({ name: a.name, value: a.count }));
  const affilData: ChartPoint[] = topAffils.map((a) => ({ name: a.name, value: a.count }));
  const topicData: ChartPoint[] = dist.map((d) => ({ name: getTopicLabel(d.topic, lang), value: d.count }));
  const totalPapers = sessions.length;

  return (
    <section className="rounded-lg border border-line bg-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-line bg-paper/30">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          {labels.topicDistribution}
        </p>
      </div>
      <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-line">
        <div className="p-5 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">{labels.topAuthors}</p>
          <MiniBar data={authorData} layout="vertical" height={180} />
        </div>

        <div className="p-5 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">{labels.topAffiliations}</p>
          <MiniBar data={affilData} layout="vertical" height={180} color={CHART_COLORS.secondary.start} />
        </div>

        <div className="p-5 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">{labels.topicDistribution}</p>
          <MiniPie data={topicData} height={220} innerRadius={50} total={totalPapers} />
        </div>
      </div>
    </section>
  );
}
