import { Topbar } from "@/components/admin/Topbar";
import { listAllPapersLight } from "@/lib/admin/papers";
import { listAllConferencesLight } from "@/lib/admin/conferences";
import { listAllOpenSourceLight } from "@/lib/admin/opensource";
import { listAllTalentsLight } from "@/lib/admin/talents";
import { aggregateTopics, detectDuplicates } from "@/lib/admin/topic-aggregator";
import { getDict } from "@/lib/i18n/server";
import { TopicsClient } from "./TopicsClient";

export default async function TopicsPage() {
  const { lang, t } = await getDict();

  const [papers, conferences, opensource, talents] = await Promise.all([
    listAllPapersLight(),
    listAllConferencesLight(),
    listAllOpenSourceLight(),
    listAllTalentsLight(),
  ]);

  const raw = aggregateTopics(papers, conferences, talents, opensource);
  const stats = detectDuplicates(raw);

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
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10">
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
        }} />
      </main>
    </>
  );
}
