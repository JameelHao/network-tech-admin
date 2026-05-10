import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { conference_id, sessions } = body as {
    conference_id: string;
    sessions: { title: string; authors: string[]; affiliations?: string[]; topics?: string[]; url?: string }[];
  };

  if (!conference_id || !sessions?.length) {
    return NextResponse.json({ error: "conference_id and sessions[] required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("conference_sessions")
    .select("title")
    .eq("conference_id", conference_id);

  const existingTitles = new Set((existing ?? []).map((e) => e.title.toLowerCase()));

  const newSessions = sessions
    .filter((s) => !existingTitles.has(s.title.toLowerCase()))
    .map((s) => ({
      conference_id,
      title: s.title,
      authors: s.authors ?? [],
      affiliations: s.affiliations ?? [],
      topics: s.topics ?? [],
      url: s.url ?? null,
    }));

  if (newSessions.length === 0) {
    return NextResponse.json({ success: true, imported: 0, message: "all sessions already exist" });
  }

  const { error } = await supabase.from("conference_sessions").insert(newSessions);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, imported: newSessions.length });
}
