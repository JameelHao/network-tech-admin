import { spawnSync } from "child_process";
import { supabase } from "../lib/supabase.js";

export async function generateConfSummary(conferenceId: string): Promise<string | null> {
  const { data: conf } = await supabase
    .from("conferences")
    .select("id, name, abbreviation, start_date, end_date, location, category, topics, tier")
    .eq("id", conferenceId)
    .single();

  if (!conf) return null;

  const { data: sessions } = await supabase
    .from("conference_sessions")
    .select("title, authors, topics, affiliations, abstract")
    .eq("conference_id", conferenceId);

  if (!sessions?.length) return null;

  // Group data for prompt
  const topTopics = [...new Set(sessions.flatMap(s => s.topics ?? []))].slice(0, 10);
  const topAffiliations = [...new Set(sessions.flatMap(s => s.affiliations ?? []))].slice(0, 15);
  const allAuthors = sessions.flatMap(s => s.authors ?? []);
  const authorFreq = new Map<string, number>();
  for (const a of allAuthors) authorFreq.set(a, (authorFreq.get(a) ?? 0) + 1);
  const topAuthors = [...authorFreq.entries()].sort((a: [string, number], b: [string, number]) => b[1] - a[1]).slice(0, 10).map(([n]) => n);

  // Pick notable sessions (by company affil or breadth)
  const companyKeywords = ["Google","Microsoft","Meta","Amazon","Apple","NVIDIA","Intel","Huawei","Alibaba","Tencent","ByteDance","Cisco","Cloudflare","IBM","AMD","Broadcom"];
  const notableSessions = sessions.filter(s =>
    (s.affiliations ?? []).some((a: string) => companyKeywords.some((c: string) => a.includes(c)))
  ).slice(0, 5);

  const prompt = `You are a conference analysis assistant. Analyze this conference and provide a structured Chinese summary of its key outcomes.

Conference: ${conf.name} (${conf.abbreviation ?? "N/A"})
Date: ${conf.start_date ?? ""} - ${conf.end_date ?? ""}
Location: ${conf.location ?? "N/A"}
Category: ${conf.category ?? "N/A"}
Total sessions: ${sessions.length}

Top topics: ${topTopics.join(", ")}
Top affiliations: ${topAffiliations.join(", ")}

Notable company-affiliated sessions:
${notableSessions.map(s => `- ${s.title} (${(s.authors ?? []).slice(0,3).join(", ")}) [${(s.affiliations ?? []).join(", ")}]`).join("\n")}

Key authors: ${topAuthors.join(", ")}

Provide a JSON analysis:
{
  "summary_cn": "3-4 sentence Chinese overview of the conference highlights",
  "key_themes": ["theme1", "theme2", "theme3"],
  "notable_trends": "1-2 sentence analysis of technology trends observed",
  "key_players": ["company1", "company2"]
}

Return valid JSON only. Summary must be in Chinese.`;

  const r = spawnSync("claude", ["-p", "--print"], {
    input: prompt,
    encoding: "utf-8",
    timeout: 60_000,
    maxBuffer: 10 * 1024 * 1024,
  });

  if (r.error) {
    console.error(`[conf-ai] Claude error: ${r.error.message}`);
    return null;
  }

  const output = (r.stdout ?? "").trim();
  const jsonMatch = output.match(/\{[\s\S]*"summary_cn"[\s\S]*\}/);
  if (!jsonMatch) {
    console.error(`[conf-ai] No JSON in response`);
    return null;
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const summary = `**${parsed.summary_cn}**\n\n**Key Themes:** ${(parsed.key_themes ?? []).join(" · ")}\n\n**Trends:** ${parsed.notable_trends ?? ""}\n\n**Key Players:** ${(parsed.key_players ?? []).join(", ")}`;

    await supabase.from("conferences").update({ ai_summary: summary }).eq("id", conferenceId);
    console.log(`[conf-ai] Summary generated for ${conf.abbreviation ?? conf.name}`);
    return summary;
  } catch {
    console.error(`[conf-ai] Parse failed`);
    return null;
  }
}

export async function generateAllConfSummaries(): Promise<number> {
  const { data: conferences } = await supabase
    .from("conferences")
    .select("id, abbreviation, name")
    .is("ai_summary", null)
    .order("start_date", { ascending: false });

  if (!conferences?.length) return 0;

  let done = 0;
  for (const conf of conferences) {
    const result = await generateConfSummary(conf.id);
    if (result) done++;
    await new Promise(r => setTimeout(r, 2000)); // rate limit
  }
  return done;
}
