import { Topbar } from "@/components/admin/Topbar";
import { listAllPapersLight } from "@/lib/admin/papers";
import { listAllConferencesLight } from "@/lib/admin/conferences";
import { listAllOpenSourceLight } from "@/lib/admin/opensource";
import { listAllTalentsLight } from "@/lib/admin/talents";
import { aggregateTopics, detectDuplicates } from "@/lib/admin/topic-aggregator";
import { getDict } from "@/lib/i18n/server";
import { computeTopicPageStats } from "@/lib/admin/topics-utils";
import { getTopicLabel } from "@/lib/admin/topics";
import { listTopicDefinitions } from "@/lib/admin/topic-definitions";
import { TopicsClient } from "./TopicsClient";

export default async function TopicsPage() {
  const { lang, t } = await getDict();

  const [papers, conferences, opensource, talents, topics] = await Promise.all([
    listAllPapersLight(),
    listAllConferencesLight(),
    listAllOpenSourceLight(),
    listAllTalentsLight(),
    listTopicDefinitions(),
  ]);

  const raw = aggregateTopics(papers, conferences, talents, opensource, { definitions: topics, includeDefinitions: true });
  const stats = detectDuplicates(raw);
  const pageStats = computeTopicPageStats(stats);
  const hottest = stats.find((s) => s.slug === pageStats.hottestTopic);
  const hottestLabel = pageStats.hottestTopic === "—" ? "—" : (hottest?.[lang] ?? getTopicLabel(pageStats.hottestTopic, lang));

  return (
    <>
      <Topbar
        crumbs={[
          { label: t.nav.dashboard, href: "/admin" },
          { label: t.nav.topics },
        ]}
        t={t}
        lang={lang}
      />
      <main className="px-6 xl:px-10 py-10">
        <header className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
            {t.nav.topics}
          </p>
          <p className="mt-4 max-w-2xl text-[13.5px] text-ink-500">
            {t.topics.description}
          </p>
        </header>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">
          {t.topics.overview}
        </p>
        <section className="mb-4 rounded-lg border border-line bg-surface overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            <Stat label={t.topics.totalTopicsStat} value={String(pageStats.totalTopics)} sub={t.topics.totalTopicsSub} />
            <Stat label={t.topics.categories} value={String(pageStats.categoryCount)} sub={t.topics.categoriesSub} />
            <Stat label={t.topics.activeTopics} value={String(pageStats.activeCount)} sub={t.topics.activeSub} />
            <Stat label={t.topics.hottestTopic} value={hottestLabel} sub={t.topics.hottestSub} />
          </div>
        </section>

        <section data-topics-content className="rounded-lg border border-line bg-surface overflow-hidden">
          <TopicsClient stats={stats} lang={lang} labels={{
            title: t.topics.title,
            table: t.topics.table,
            heatmap: t.topics.heatmap,
            search: t.topics.search,
            allCategories: t.topics.allCategories,
            total: t.topics.total,
            duplicateWarning: t.topics.duplicateWarning,
            similarTo: t.topics.similarTo,
            noTopics: t.topics.noTopics,
            noTopicsDesc: t.topics.noTopicsDesc,
            items: t.topics.items,
            totalTopics: t.topics.totalTopics,
            hottest: t.topics.hottest,
            covered: t.topics.covered,
            showing: t.topics.showing,
            ofTopics: t.topics.ofTopics,
            rows: t.common.rows,
            page: t.common.page,
            papers: t.nav.papers,
            conferences: t.nav.conferences,
            talents: t.nav.talents,
            opensource: t.nav.opensource,
            newTopic: t.topics.newTopic,
            editTopic: t.topics.editTopic,
            slug: t.topics.slug,
            category: t.conf.category,
            englishLabel: t.topics.englishLabel,
            chineseLabel: t.topics.chineseLabel,
            addTopic: t.topics.addTopic,
            updateTopic: t.topics.updateTopic,
            deleteTopic: t.topics.deleteTopic,
            createHint: t.topics.createHint,
            deleteBlocked: t.topics.deleteBlocked,
            actions: t.topics.actions,
            clear: t.topics.clear,
          }} />
        </section>
      </main>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-surface p-6">
      <p className="tracked-label">{label}</p>
      <p className="mt-3 font-sans text-[30px] font-bold leading-none text-ink-900 tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-[12px] text-ink-500">{sub}</p>
    </div>
  );
}
