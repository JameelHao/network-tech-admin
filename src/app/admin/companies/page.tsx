import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";
import { COMPANY_NAMES } from "@/lib/admin/companies";
import { CompaniesClient } from "./CompaniesClient";

export default async function CompaniesPage() {
  const { lang, t } = await getDict();
  const supabase = await createClient();

  const [vendorsRes, paperCounts, newsCounts, repoStats] = await Promise.all([
    supabase.from("vendors").select("id, name, topics, ai_insights, paper_count, product_count, news_count").not("name", "is", null).order("paper_count", { ascending: false }),
    supabase.from("papers").select("companies"),
    supabase.from("news_items").select("companies").eq("category", "news"),
    supabase.from("github_repos").select("company_slug"),
  ]);

  const repoCountMap = new Map<string, number>();
  for (const r of repoStats.data ?? []) {
    repoCountMap.set(r.company_slug, (repoCountMap.get(r.company_slug) ?? 0) + 1);
  }

  // Map vendor name -> vendor row
  const vendorByName = new Map((vendorsRes.data ?? []).map((v: any) => [v.name, v]));

  const companies = Object.entries(COMPANY_NAMES).map(([slug, name]) => {
    const vendor = vendorByName.get(name);
    const paperCount = vendor?.paper_count ?? (paperCounts.data ?? []).filter((r: any) => r.companies?.includes(slug)).length;
    const newsCount = vendor?.news_count ?? (newsCounts.data ?? []).filter((r: any) => r.companies?.includes(slug)).length;
    const repoCount = repoCountMap.get(slug) ?? 0;
    const topics: string[] = vendor?.topics ?? [];
    const aiInsights = vendor?.ai_insights ?? null;

    return {
      slug,
      name,
      topics,
      aiInsights,
      paperCount,
      newsCount,
      repoCount,
      total: paperCount + newsCount + repoCount,
    };
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
          <p className="mt-2 text-[13px] text-ink-500 max-w-xl">{lang === "zh" ? "按公司分类浏览论文、新闻和 GitHub 仓库" : "Browse papers, news and GitHub repos by company"}</p>
        </header>
        <CompaniesClient companies={companies} lang={lang} />
      </main>
    </>
  );
}
