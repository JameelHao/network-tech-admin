import { spawnSync } from "child_process";

type QualityVerdict = {
  idx: number;
  keep: boolean;
  relevance_score: number;
  reason: string;
};

const SYSTEM_PROMPT = `You are a quality filter for networking news. Rate each article on relevance to professional networking/cloud/infrastructure engineering and assign a relevance_score (1-10).

Score guide:
- 9-10: Direct networking content (protocols, architectures, deployments)
- 7-8: Related infrastructure (cloud, security, edge, data center)
- 5-6: General tech that could relate to networking
- 3-4: Tangentially related, little substance
- 1-2: Not relevant

Keep if score >= 5 (real technical content, industry analysis, product releases with detail).
Discard if score < 5 (press releases, fluff, irrelevant topics, vague announcements).

Return JSON only: {"verdicts": [{"idx": 1, "keep": true, "relevance_score": 8, "reason": "concrete technical details on X"}]}`;

export function filterQuality(items: { title: string; snippet: string }[]): { keep: boolean[]; scores: number[] } {
  if (items.length === 0) return { keep: [], scores: [] };

  const keep: boolean[] = new Array(items.length).fill(false);
  const scores: number[] = new Array(items.length).fill(0);

  for (let offset = 0; offset < items.length; offset += 15) {
    const batch = items.slice(offset, offset + 15);
    const input = batch.map((item, i) =>
      `[${i + 1}] Title: ${item.title}\n    Excerpt: ${item.snippet.slice(0, 300)}`
    ).join("\n\n");

    const prompt = `${SYSTEM_PROMPT}\n\n${input}`;

    const r = spawnSync("claude", ["-p", "--print"], {
      input: prompt,
      encoding: "utf-8",
      timeout: 60_000,
      maxBuffer: 10 * 1024 * 1024,
    });

    if (r.error) {
      console.error(`[quality] Claude error: ${r.error.message}`);
      for (let i = 0; i < batch.length; i++) { keep[offset + i] = true; scores[offset + i] = 5; }
      continue;
    }

    const output = (r.stdout ?? "").trim();
    const jsonMatch = output.match(/\{[\s\S]*"verdicts"[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`[quality] No JSON, keeping batch. Raw: ${output.slice(0, 200)}`);
      for (let i = 0; i < batch.length; i++) { keep[offset + i] = true; scores[offset + i] = 5; }
      continue;
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const verdicts: QualityVerdict[] = parsed.verdicts ?? [];
      for (const v of verdicts) {
        const idx = offset + v.idx - 1;
        if (idx >= 0 && idx < items.length) {
          keep[idx] = v.keep;
          scores[idx] = v.relevance_score ?? 5;
          if (!v.keep) console.log(`[quality] Discard: "${batch[v.idx - 1]?.title?.slice(0, 60)}" (${v.relevance_score}) — ${v.reason}`);
        }
      }
    } catch {
      for (let i = 0; i < batch.length; i++) { keep[offset + i] = true; scores[offset + i] = 5; }
    }
  }

  return { keep, scores };
}
