import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";
import { StatCard } from "@/components/admin/StatCard";
import { MiniBar } from "@/components/admin/charts/MiniBar";
import { MiniLine } from "@/components/admin/charts/MiniLine";
import { MiniPie } from "@/components/admin/charts/MiniPie";
import { Funnel } from "@/components/admin/charts/Funnel";
import { Heatmap } from "@/components/admin/charts/Heatmap";
import {
  getPaperMonthlyTrend,
  getPaperTopTopics,
  getPaperVenueDistribution,
  getPaperTopicHeatmap,
  getConferenceQuarterlyTrend,
  getConferenceTierDistribution,
  getConferenceCategoryTrend,
  getLeadStageFunnel,
  getLeadSourceDistribution,
  getLeadMonthlyTrend,
  getTalentCompanyTop,
  getTalentTopicFrequency,
  getTalentStageDistribution,
  getNewsDailyTrend,
  getNewsSourceActivity,
  getJobsByCompany,
} from "@/lib/admin/insights";

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-4">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ChartCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <p className="text-xs text-ink-500 mb-2">{label}</p>
      {children}
    </div>
  );
}

export default async function InsightsPage() {
  const { lang, t } = await getDict();

  const [
    paperTrend,
    paperTopics,
    paperVenues,
    paperHeatmap,
    confQuarterly,
    confTiers,
    confCategories,
    leadFunnel,
    leadSources,
    leadTrend,
    talentCompanies,
    talentTopics,
    talentStages,
    newsTrend,
    newsSources,
    jobCompanies,
  ] = await Promise.all([
    getPaperMonthlyTrend(),
    getPaperTopTopics(),
    getPaperVenueDistribution(),
    getPaperTopicHeatmap(),
    getConferenceQuarterlyTrend(),
    getConferenceTierDistribution(),
    getConferenceCategoryTrend(),
    getLeadStageFunnel(),
    getLeadSourceDistribution(),
    getLeadMonthlyTrend(),
    getTalentCompanyTop(),
    getTalentTopicFrequency(),
    getTalentStageDistribution(),
    getNewsDailyTrend(),
    getNewsSourceActivity(),
    getJobsByCompany(),
  ]);

  const paperTotal = paperTrend.reduce((s, p) => s + p.value, 0);
  const confTotal = confQuarterly.reduce((s, p) => s + p.value, 0);
  const leadTotal = leadFunnel.reduce((s, p) => s + p.value, 0);
  const talentTotal = talentStages.reduce((s, p) => s + p.value, 0);
  const newsTotal = newsTrend.reduce((s, p) => s + p.value, 0);

  return (
    <>
      <Topbar
        crumbs={[
          { label: t.nav.dashboard, href: "/admin" },
          { label: t.nav.insights },
        ]}
        t={t}
        lang={lang}
      />
      <main className="px-6 xl:px-10 py-10 space-y-8">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
            {t.insights.title}
          </p>
          <p className="mt-4 max-w-2xl text-[13.5px] text-ink-500">
            {t.insights.description}
          </p>
        </header>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.insights.overview}</p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-line rounded-lg overflow-hidden border border-line">
          <StatCard label={t.insights.papers} value={paperTotal} />
          <StatCard label={t.insights.conferences} value={confTotal} />
          <StatCard label={t.insights.leads} value={leadTotal} />
          <StatCard label={t.insights.talents} value={talentTotal} />
          <StatCard label={t.insights.newsItems} value={newsTotal} sub={t.insights.last30days} />
        </div>
      </div>

      {/* Papers */}
      <SectionCard title={t.insights.paperTrends}>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard label={t.insights.monthlyPublications}>
            <MiniLine data={paperTrend} />
          </ChartCard>
          <ChartCard label={t.insights.topTopics}>
            <MiniBar data={paperTopics} />
          </ChartCard>
          <ChartCard label={t.insights.venueDistribution}>
            <MiniPie data={paperVenues} />
          </ChartCard>
        </div>
        {paperHeatmap.length > 0 && (
          <ChartCard label={t.insights.topicHeatmap}>
            <Heatmap
              data={paperHeatmap}
              xLabels={[...new Set(paperHeatmap.map((p) => p.month))].sort()}
              yLabels={[...new Set(paperHeatmap.map((p) => p.topic))]}
            />
          </ChartCard>
        )}
      </SectionCard>

      {/* Conferences */}
      <SectionCard title={t.insights.conferenceHeat}>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard label={t.insights.quarterlyTrend}>
            <MiniBar data={confQuarterly} layout="horizontal" />
          </ChartCard>
          <ChartCard label={t.insights.tierDistribution}>
            <MiniPie data={confTiers} />
          </ChartCard>
          <ChartCard label={t.insights.categoryTrend}>
            <MiniBar
              data={confCategories.map((c) => {
                const { name, ...rest } = c;
                const total = Object.values(rest).reduce(
                  (s: number, v) => s + (typeof v === "number" ? v : 0),
                  0,
                );
                return { name: name as string, value: total };
              })}
              layout="horizontal"
            />
          </ChartCard>
        </div>
      </SectionCard>

      {/* Leads */}
      <SectionCard title={t.insights.leadFunnel}>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard label={t.insights.stageFunnel}>
            <Funnel data={leadFunnel} />
          </ChartCard>
          <ChartCard label={t.insights.sourceDistribution}>
            <MiniPie data={leadSources} />
          </ChartCard>
          <ChartCard label={t.insights.monthlyNewLeads}>
            <MiniLine data={leadTrend} />
          </ChartCard>
        </div>
      </SectionCard>

      {/* Talents */}
      <SectionCard title={t.insights.talentMap}>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard label={t.insights.topCompanies}>
            <MiniBar data={talentCompanies} />
          </ChartCard>
          <ChartCard label={t.insights.topicFrequency}>
            <MiniBar data={talentTopics} />
          </ChartCard>
          <ChartCard label={t.insights.stageDistribution}>
            <MiniPie data={talentStages} />
          </ChartCard>
        </div>
      </SectionCard>

      {/* News & Jobs */}
      <SectionCard title={t.insights.newsAndJobs}>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard label={t.insights.dailyNewsTrend}>
            <MiniLine data={newsTrend} />
          </ChartCard>
          <ChartCard label={t.insights.topNewsSources}>
            <MiniBar data={newsSources} />
          </ChartCard>
          <ChartCard label={t.insights.jobsByCompany}>
            <MiniBar data={jobCompanies} />
          </ChartCard>
        </div>
      </SectionCard>
      </main>
    </>
  );
}
