import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing conference id" }, { status: 400 });

  const supabase = await createClient();
  const { data: conf } = await supabase.from("conferences").select("*").eq("id", id).single();
  if (!conf) return NextResponse.json({ error: "Conference not found" }, { status: 404 });

  const { data: sessions } = await supabase
    .from("conference_sessions")
    .select("title, authors, topics, affiliations, abstract")
    .eq("conference_id", id);

  if (!sessions?.length) return NextResponse.json({ error: "No sessions found" }, { status: 400 });

  // Build prompt and call Claude
  const topTopics = [...new Set(sessions.flatMap(s => s.topics ?? []))].slice(0, 10);
  const topAffiliations = [...new Set(sessions.flatMap(s => s.affiliations ?? []))].slice(0, 15);
  const allAuthors = sessions.flatMap(s => s.authors ?? []);
  const authorFreq = new Map<string, number>();
  for (const a of allAuthors) authorFreq.set(a, (authorFreq.get(a) ?? 0) + 1);
  const topAuthors = [...authorFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([n]) => n);

  const companyKeywords = ["Google","Microsoft","NVIDIA","Intel","Huawei","Alibaba","Apple","Meta","Amazon","Cisco","Cloudflare","IBM","AMD","Broadcom","ByteDance","Tencent"];
  const notableSessions = sessions.filter((s: any) => (s.affiliations ?? []).some((a: string) => companyKeywords.some((c: string) => a.includes(c)))).slice(0, 5);

  const prompt = `Analyze this conference, provide Chinese summary.

Conference: ${conf.name}
Sessions: ${sessions.length}
Topics: ${topTopics.join(", ")}
Affiliations: ${topAffiliations.join(", ")}
Notable sessions: ${notableSessions.map(s => `- ${s.title} [${(s.affiliations ?? []).join(", ")}]`).join("\n")}
Key authors: ${topAuthors.join(", ")}

Return JSON:
{"summary_cn": "3-4 sentence Chinese overview", "key_themes": ["t1","t2","t3"], "notable_trends": "trend observation", "key_players": ["c1","c2"]}

Return valid JSON only. Summary in Chinese.`;

  const { spawnSync } = await import("child_process");
  const r = spawnSync("claude", ["-p", "--print"], {
    input: prompt, encoding: "utf-8", timeout: 60_000, maxBuffer: 10 * 1024 * 1024,
  });
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });

  const output = (r.stdout ?? "").trim();
  const jsonMatch = output.match(/\{[\s\S]*"summary_cn"[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json({ error: "No JSON in response" }, { status: 500 });

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const summary = `**${parsed.summary_cn}**\n\n**Key Themes:** ${(parsed.key_themes ?? []).join(" · ")}\n\n**Trends:** ${parsed.notable_trends ?? ""}\n\n**Key Players:** ${(parsed.key_players ?? []).join(", ")}`;

    await supabase.from("conferences").update({ ai_summary: summary }).eq("id", id);
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: "Parse failed" }, { status: 500 });
  }
}
