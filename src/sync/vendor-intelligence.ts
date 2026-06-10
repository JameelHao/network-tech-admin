import { spawnSync } from "child_process";
import { supabase } from "../lib/supabase.js";

type VendorData = {
  id: string;
  name: string;
  slug: string;
  paperCount: number;
  paperTopics: string[];
  productCount: number;
  productTopics: string[];
  newsCount: number;
  newsTopics: string[];
  recentPaper: string | null;
  recentNews: string | null;
};

async function collectVendorData(slug: string): Promise<VendorData | null> {
  const name = COMPANY_NAMES[slug];
  if (!name) return null;

  const [{ data: papers }, { data: products }, { data: newsItems }] = await Promise.all([
    supabase.from("papers").select("title, published_date, paper_topics(topic_slug)")
      .contains("companies", [slug]).limit(100),
    supabase.from("products").select("name, topics")
      .ilike("vendor", `%${name}%`).limit(50),
    supabase.from("news_items").select("title, pub_date, ai_topics")
      .contains("companies", [slug]).limit(50),
  ]);

  const paperTopics = [...new Set((papers ?? []).flatMap(p => (p as any).paper_topics?.map((pt: any) => pt.topic_slug) ?? []))];
  const productTopics = [...new Set((products ?? []).flatMap(p => p.topics ?? []))];
  const newsTopics = [...new Set((newsItems ?? []).flatMap(n => (n as any).ai_topics ?? []))];

  const sortedPapers = (papers ?? []).sort((a: any, b: any) => ((b.published_date ?? "") > (a.published_date ?? "") ? 1 : -1));
  const sortedNews = (newsItems ?? []).sort((a: any, b: any) => ((b.pub_date ?? "") > (a.pub_date ?? "") ? 1 : -1));

  return {
    id: slug,
    name: COMPANY_NAMES[slug] ?? slug,
    slug,
    paperCount: papers?.length ?? 0,
    paperTopics,
    productCount: products?.length ?? 0,
    productTopics,
    newsCount: newsItems?.length ?? 0,
    newsTopics,
    recentPaper: sortedPapers[0]?.title ?? null,
    recentNews: sortedNews[0]?.title ?? null,
  };
}

const COMPANY_NAMES: Record<string, string> = {
  cisco: "Cisco", google: "Google", ericsson: "Ericsson", nokia: "Nokia",
  aws: "AWS", microsoft: "Microsoft", openai: "OpenAI", nvidia: "NVIDIA",
  meta: "Meta", micron: "Micron", broadcom: "Broadcom", intel: "Intel",
  ibm: "IBM", huawei: "Huawei", cloudflare: "Cloudflare", apple: "Apple",
  amd: "AMD", tencent: "Tencent", alibaba: "Alibaba", baidu: "Baidu",
  bytedance: "ByteDance",
};

function generateAiAnalysis(data: VendorData): string {
  const allTopics = [...new Set([...data.paperTopics, ...data.productTopics, ...data.newsTopics])];
  const topicBreakdown = [
    ...(data.paperTopics.length ? [`\n  Research: ${data.paperTopics.join(", ")} (${data.paperCount} papers)`] : []),
    ...(data.productTopics.length ? [`\n  Products: ${data.productTopics.join(", ")} (${data.productCount} products)`] : []),
    ...(data.newsTopics.length ? [`\n  News: ${data.newsTopics.join(", ")} (${data.newsCount} articles)`] : []),
  ].join("");

  const prompt = `You are a competitive intelligence analyst. Analyze this networking vendor's technology profile based on their research papers, products, and news coverage.

Company: ${data.name}
Total topics: ${allTopics.join(", ")}${topicBreakdown}

Recent activity:
${data.recentPaper ? `- Latest paper: ${data.recentPaper}` : ""}
${data.recentNews ? `- Latest news: ${data.recentNews}` : ""}

Return JSON only:
{
  "strengths": ["top 3 technical strengths"],
  "focus_areas": ["top 3-4 strategic focus areas"],
  "technology_position": "1-2 sentence assessment of their tech positioning",
  "activity_level": "high" | "medium" | "low",
  "emerging_signals": ["any notable signals or shifts in their focus"]
}`;

  const r = spawnSync("claude", ["-p", "--print"], {
    input: prompt, encoding: "utf-8", timeout: 60_000, maxBuffer: 10 * 1024 * 1024,
  });

  if (r.error) return JSON.stringify({ error: r.error.message });
  const output = (r.stdout ?? "").trim();
  const jsonMatch = output.match(/\{[\s\S]*"strengths"[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : JSON.stringify({ error: "Parse failed" });
}

export async function syncVendorIntelligence(slugs?: string[]): Promise<number> {
  const targetSlugs = slugs ?? Object.keys(COMPANY_NAMES);
  let done = 0;

  for (const slug of targetSlugs) {
    console.log(`[vendor-intel] Processing ${slug}...`);
    const data = await collectVendorData(slug);
    if (!data) continue;

    // Aggregate topics from all sources
    const allTopics = [...new Set([...data.paperTopics, ...data.productTopics, ...data.newsTopics])];
    const topicCounts = new Map<string, number>();
    for (const t of [...(data.paperTopics ?? []), ...(data.productTopics ?? []), ...(data.newsTopics ?? [])]) {
      topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1);
    }

    const aiRaw = generateAiAnalysis(data);
    let aiParsed: Record<string, any> = {};
    try { aiParsed = JSON.parse(aiRaw); } catch { aiParsed = { error: "parse failed" }; }

    // Store in vendors table
    const { data: existing } = await supabase.from("vendors").select("id").eq("name", data.name).maybeSingle();
    const vdata = { name: data.name, type: "vendor", stage: "active", topics: allTopics, paper_count: data.paperCount, product_count: data.productCount, news_count: data.newsCount, last_activity_date: new Date().toISOString().slice(0, 10), ai_insights: aiParsed };
    if (existing) {
      await supabase.from("vendors").update(vdata).eq("id", existing.id);
    } else {
      await supabase.from("vendors").insert(vdata);
    }
    done++;
    console.log(`[vendor-intel] Done ${data.name} — ${allTopics.length} topics, AI: ${aiParsed.strengths?.[0] ?? "N/A"}`);
    await new Promise(r => setTimeout(r, 2000));
  }
  return done;
}
