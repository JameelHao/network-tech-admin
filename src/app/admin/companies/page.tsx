import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/Topbar";
import { getDict } from "@/lib/i18n/server";
import { COMPANY_NAMES, COMPANY_COLORS } from "@/lib/admin/companies";
import { getStoredRepoCount } from "@/lib/admin/github";
import { CompanyHeatmap } from "@/components/admin/CompanyHeatmap";
import { CompaniesClient } from "./CompaniesClient";

export default async function CompaniesPage() {
  const { lang, t } = await getDict();
  const supabase = await createClient();

  const [paperCounts, newsCounts, repoStats, productRows] = await Promise.all([
    supabase.from("papers").select("companies"),
    supabase.from("news_items").select("companies").eq("category", "news"),
    supabase.from("github_repos").select("company_slug, pushed_at"),
    supabase.from("products").select("vendor"),
  ]);

  const repoCountMap = new Map<string, number>();
  const repoPushMap = new Map<string, string>();
  for (const r of repoStats.data ?? []) {
    repoCountMap.set(r.company_slug, (repoCountMap.get(r.company_slug) ?? 0) + 1);
    const cur = repoPushMap.get(r.company_slug);
    if (r.pushed_at && (!cur || r.pushed_at > cur)) repoPushMap.set(r.company_slug, r.pushed_at);
  }

  const productVendorCount = new Map<string, number>();
  for (const r of productRows.data ?? []) {
    if (!r.vendor) continue;
    productVendorCount.set(r.vendor, (productVendorCount.get(r.vendor) ?? 0) + 1);
  }

  const companies = Object.entries(COMPANY_NAMES).map(([slug, name]) => {
    const paperCount = (paperCounts.data ?? []).filter((r) => r.companies?.includes(slug)).length;
    const newsCount = (newsCounts.data ?? []).filter((r) => r.companies?.includes(slug)).length;
    const repoCount = repoCountMap.get(slug) ?? 0;
    const productCount = productVendorCount.get(name) ?? 0;
    const latestRepoPush = repoPushMap.get(slug) ?? null;
    return { slug, name, color: COMPANY_COLORS[slug] ?? "", paperCount, newsCount, repoCount, productCount, latestRepoPush, total: paperCount + newsCount + repoCount + productCount };
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
        <CompanyHeatmap
          data={companies}
          lang={lang}
          labels={{ title: lang === "zh" ? "公司活跃度热力图" : "Company Activity Heatmap", papers: t.nav.papers, news: t.nav.news, repos: t.detail.repo, products: t.nav.products }}
        />
        <CompaniesClient companies={companies} lang={lang} />
      </main>
    </>
  );
}
