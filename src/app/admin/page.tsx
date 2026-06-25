import { Topbar } from "@/components/admin/Topbar";
import { EmptyState } from "@/components/admin/EmptyState";
import { VendorIntelligenceGrid } from "@/components/admin/charts/VendorIntelligenceGrid";
import { TechTrendChart } from "@/components/admin/charts/TechTrendChart";
import { getTopicMonthlyTrend } from "@/lib/admin/ecosystem-stats";
import { getDict } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-surface overflow-hidden">
      <div className="px-5 py-3.5 border-b border-line bg-paper/30">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{title}</h3>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export default async function DashboardPage() {
  const { lang, t } = await getDict();
  const supabase = await createClient();

  async function fetchAllPapersInRange(start: string, end: string) {
    const all: any[] = [];
    let page = 0;
    while (true) {
      const from = page * 1000;
      const to = from + 999;
      const { data } = await supabase
        .from("papers")
        .select("published_date, paper_topics(topic_slug)")
        .gte("published_date", start).lte("published_date", end)
        .order("published_date", { ascending: false }).range(from, to);
      if (!data || data.length === 0) break;
      all.push(...data);
      if (data.length < 1000) break;
      page++;
    }
    return all;
  }

  const MONTH_RANGES = [
    ["2026-03-01", "2026-03-31"],
    ["2026-04-01", "2026-04-30"],
    ["2026-05-01", "2026-05-31"],
    ["2026-06-01", "2026-06-30"],
  ];
  const monthTrendPromises = MONTH_RANGES.map(([s, e]) => fetchAllPapersInRange(s, e));

  const [vendorIntel, ...trendMonths] = await Promise.all([
    supabase.from("vendors").select("id, name, topics, ai_insights, paper_count, product_count, news_count").not("name", "is", null).order("paper_count", { ascending: false }),
    ...monthTrendPromises,
  ]);

  const vendorIntelData = (vendorIntel.data ?? []).filter((v: any) => v.name);

  const trendPapers = trendMonths.flat()
    .map((r: any) => ({
      published_date: r.published_date,
      topics: (r.paper_topics ?? []).map((pt: any) => pt.topic_slug),
    }));
  const trendData = getTopicMonthlyTrend(trendPapers, 8);
  const trendTopicKeys = trendData.length > 0
    ? Object.keys(trendData[0]).filter((k) => k !== "period")
    : [];

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard }]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10 max-w-[1200px] mx-auto">
        <header className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">{t.nav.dashboard}</p>
          <p className="mt-3 max-w-2xl text-[13px] text-ink-500 leading-relaxed">{t.dashboard.description}</p>
        </header>


        {/* Tech Trend */}
        <SectionCard title={t.ecosystem.techTrend}>
          {trendData.length > 0 ? (
            <TechTrendChart data={trendData} topicKeys={trendTopicKeys} lang={lang} />
          ) : (
            <EmptyState title={t.ecosystem.noEvents} description={t.ecosystem.noEventsDesc} compact />
          )}
        </SectionCard>

        {/* Vendor intelligence */}
        <div className="mt-6">
          <SectionCard title={t.ecosystem.vendorTopicLayout}>
            {vendorIntelData.length > 0 ? (
              <VendorIntelligenceGrid data={vendorIntelData} lang={lang} />
            ) : (
              <EmptyState title={t.empty.vendors} description={t.empty.vendorsDesc} compact />
            )}
          </SectionCard>
        </div>

	      </main>
	    </>
	  );
	}
