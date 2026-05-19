import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";
import { COMPANY_NAMES, COMPANY_COLORS } from "@/lib/admin/companies";
import { CompaniesClient } from "./CompaniesClient";

export default async function CompaniesPage() {
  const { lang, t } = await getDict();
  const supabase = await createClient();

  const [paperCounts, newsCounts, patentCounts] = await Promise.all([
    supabase.from("papers").select("companies"),
    supabase.from("news_items").select("companies").eq("category", "news"),
    supabase.from("patents").select("company_slug"),
  ]);

  const patentMap = new Map<string, number>();
  for (const r of patentCounts.data ?? []) {
    patentMap.set(r.company_slug, (patentMap.get(r.company_slug) ?? 0) + 1);
  }

  const companies = Object.entries(COMPANY_NAMES).map(([slug, name]) => {
    const paperCount = (paperCounts.data ?? []).filter((r) => r.companies?.includes(slug)).length;
    const newsCount = (newsCounts.data ?? []).filter((r) => r.companies?.includes(slug)).length;
    const patentCount = patentMap.get(slug) ?? 0;
    return { slug, name, color: COMPANY_COLORS[slug] ?? "", paperCount, newsCount, patentCount, total: paperCount + newsCount + patentCount };
  });

  companies.sort((a, b) => b.total - a.total);

  return (
    <>
      <Topbar
        crumbs={[
          { label: t.nav.dashboard, href: "/admin" },
          { label: t.nav.companies },
        ]}
        t={t}
        lang={lang}
      />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10 w-full space-y-6">
        <header className="mb-2">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">{t.nav.companies}</p>
          <p className="mt-2 text-[13px] text-ink-500 max-w-xl">{lang === "zh" ? "按公司分类浏览论文、新闻和专利" : "Browse papers, news and patents by company"}</p>
        </header>
        <CompaniesClient companies={companies} lang={lang} />
      </main>
    </>
  );
}
