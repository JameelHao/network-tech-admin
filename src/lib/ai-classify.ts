import { spawnSync } from "child_process";
import { supabase } from "./supabase.js";

const VALID_TOPICS = [
  "dc-networking", "transport-protocols", "programmable-net", "sdn-nfv",
  "congestion-ctrl", "internet-measure", "traffic-analysis", "dns-bgp",
  "network-monitoring", "network-observability", "ddos-defense", "protocol-security",
  "privacy-anonymity", "side-channels", "zero-trust", "sase-sse",
  "edge-computing", "network-ai", "machine-learning", "optimization",
  "ai-networking", "network-digital-twin", "intent-based-networking",
  "satellite-leo", "quantum-networking", "5g-6g", "mobile-wireless",
  "ebpf-xdp", "distributed-sys", "storage-net", "os-network-stack",
  "cloud-infra", "hpc", "high-speed-networking", "parallel-computing",
  "security", "automation", "observability",
];

function buildClassifyPrompt(items: { title: string; abstract?: string | null }[]): string {
  const itemBlock = items.map((item, i) =>
    `[${i + 1}] Title: ${item.title}\n    Abstract: ${(item.abstract ?? "").slice(0, 600)}`
  ).join("\n\n");

  return `You are a network research classifier. For each item, return:
1. 1-3 topic slugs from this list: ${VALID_TOPICS.join(", ")}
2. A 2-3 sentence Chinese summary of the paper's key contribution
3. A relevance_score (1-10) measuring how relevant this item is to professional networking/cloud/infrastructure engineering

Scoring guide:
- 9-10: Direct networking research (protocols, architectures, measurement, SDN, routing)
- 7-8: Related infrastructure (distributed systems, cloud, security, edge, hardware)
- 5-6: General CS/ML that could apply to networking
- 3-4: Tangentially related, little networking substance
- 1-2: Not relevant to networking at all

Return JSON only:
{"results": [{"idx": 1, "topics": ["slug1"], "summary_cn": "中文摘要", "relevance_score": 8, "reason": "short reason"}]}

Rules:
- Only use topic slugs from the list
- "machine-learning" = ML method paper, "network-ai" = AI applied to networking
- "security" = general, use specific (ddos-defense, protocol-security) when more precise
- Summary must be in Chinese, 2-3 sentences, focus on contribution

Items:
${itemBlock}`;
}

function callClaude(prompt: string): string {
  const r = spawnSync("claude", ["-p", "--print"], {
    input: prompt,
    encoding: "utf-8",
    timeout: 120_000,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (r.error) { console.error("[ai] Claude spawn error:", r.error.message); return "[]"; }
  const output = (r.stdout ?? "").trim();
  // Accept both "results" (new) and "classifications" (old) format
  const jsonMatch = output.match(/\{[\s\S]*"results"[\s\S]*\}/) || output.match(/\{[\s\S]*"classifications"[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[ai] No JSON in response, raw:", output.slice(0, 300));
    return "[]";
  }
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    // Normalize to "classifications" key
    const data = parsed.results ?? parsed.classifications ?? [];
    return JSON.stringify(data);
  } catch { return "[]"; }
}

export async function classifyPapers(batchSize = 30): Promise<{ processed: number; updated: number }> {
  let totalProcessed = 0;
  let totalUpdated = 0;
  const allPaperIds: string[] = [];

  for (let round = 0; round < 100; round++) {
    const { data: papers, error } = await supabase
      .from("papers")
      .select("id, title, abstract")
      .eq("ai_classified", false)
      .neq("title", "test paper")
      .limit(batchSize);

    if (error) { console.error(`[ai] Papers query error: ${error.message}`); break; }
    if (!papers?.length) { console.log(`[ai] No more unclassified papers`); break; }

    console.log(`[ai] Batch ${round + 1}: ${papers.length} papers (${papers[0].title.slice(0, 40)}...)`);

    const prompt = buildClassifyPrompt(papers.map(p => ({ title: p.title, abstract: p.abstract })));
    const raw = callClaude(prompt);

    let results: { idx: number; topics: string[]; summary_cn?: string; relevance_score?: number }[];
    try { results = JSON.parse(raw); } catch { console.error("[ai] JSON parse failed"); break; }

    let updated = 0;
    const batchIds: string[] = [];
    for (const r of results) {
      const paper = papers[r.idx - 1];
      if (!paper) continue;
      if (r.topics?.length) {
        await supabase.from("paper_topics").delete().eq("paper_id", paper.id);
        const rows = r.topics.map(t => ({ paper_id: paper.id, topic_slug: t }));
        if (rows.length) await supabase.from("paper_topics").insert(rows);
      }
      const updateData: Record<string, any> = { ai_classified: true };
      if (r.summary_cn) updateData.ai_summary = r.summary_cn;
      if (r.relevance_score) updateData.relevance_score = r.relevance_score;
      await supabase.from("papers").update(updateData).eq("id", paper.id);
      batchIds.push(paper.id);
      updated++;
    }
    allPaperIds.push(...batchIds);
    totalProcessed += papers.length;
    totalUpdated += updated;
    console.log(`[ai] Batch done: ${updated}/${papers.length} updated`);
  }

  // Find similar papers for newly classified papers
  if (allPaperIds.length > 0) {
    await findSimilarPapers(allPaperIds);
  }

  return { processed: totalProcessed, updated: totalUpdated };
}

export async function findSimilarPapers(
  paperIds: string[],
): Promise<void> {
  if (!paperIds.length) return;
  console.log(`[ai] Finding similar papers for ${paperIds.length} papers...`);

  for (const id of paperIds) {
    const { data: paper } = await supabase.from("papers").select("id, title").eq("id", id).single();
    if (!paper) continue;

    // Keywords from title
    const keywords = paper.title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4).slice(0, 5);
    if (keywords.length < 2) continue;

    const wordQuery = keywords.map((k: string) => `title.ilike.%${k}%`).join(",");
    const { data: candidates } = await supabase
      .from("papers")
      .select("id, title")
      .eq("ai_classified", true)
      .neq("id", paper.id)
      .or(wordQuery)
      .limit(15);

    if (!candidates?.length) continue;

    const prompt = `From these papers, pick the 5 most similar to the reference paper. Return JSON: {"similar_ids": ["id1","id2","id3","id4","id5"]}

Reference: ${paper.title.slice(0, 200)}

Candidates:
${candidates.map((c, i) => `[${i + 1}] ${c.title.slice(0, 200)} (${c.id})`).join("\n")}`;

    const r = spawnSync("claude", ["-p", "--print"], {
      input: prompt, encoding: "utf-8", timeout: 30_000, maxBuffer: 5 * 1024 * 1024,
    });
    if (r.error) continue;
    const match = (r.stdout ?? "").match(/\{[\s\S]*"similar_ids"[\s\S]*\}/);
    if (!match) continue;
    try {
      const { similar_ids } = JSON.parse(match[0]);
      if (similar_ids?.length) {
        await supabase.from("papers").update({ similar_papers: similar_ids }).eq("id", paper.id);
      }
    } catch {}
  }
  console.log(`[ai] Similar papers done`);
}

export async function classifyNews(batchSize = 30): Promise<{ processed: number; updated: number }> {
  let totalProcessed = 0;
  let totalUpdated = 0;

  for (let round = 0; round < 100; round++) {
    const { data: items, error } = await supabase
      .from("news_items")
      .select("id, title, snippet")
      .eq("ai_classified", false)
      .limit(batchSize);

    if (error) { console.error(`[ai] News query error: ${error.message}`); break; }
    if (!items?.length) { console.log(`[ai] No more unclassified news`); break; }

    console.log(`[ai] News batch ${round + 1}: ${items.length} items`);

    const prompt = buildClassifyPrompt(items.map(i => ({ title: i.title, abstract: i.snippet })));
    const raw = callClaude(prompt);

    let results: { idx: number; topics: string[]; summary_cn?: string; relevance_score?: number }[];
    try { results = JSON.parse(raw); } catch { console.error("[ai] JSON parse failed"); break; }

    let updated = 0;
    for (const r of results) {
      const item = items[r.idx - 1];
      if (!item) continue;
      const updateData: Record<string, any> = { ai_classified: true };
      if (r.topics?.length) updateData.ai_topics = r.topics;
      if (r.relevance_score) updateData.relevance_score = r.relevance_score;
      await supabase.from("news_items").update(updateData).eq("id", item.id);
      updated++;
    }
    totalProcessed += items.length;
    totalUpdated += updated;
    console.log(`[ai] News batch done: ${updated}/${items.length} updated`);
  }

  return { processed: totalProcessed, updated: totalUpdated };
}
