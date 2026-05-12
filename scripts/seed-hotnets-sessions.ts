import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ABBREVIATION = "HotNets";
const YEAR = "2026";

// Submission deadline: Jul 16, 2026. Author notification: Sep 24, 2026.
// Populate sessions after accepted papers are announced.
const sessions: { title: string; authors: string[]; affiliations: string[]; topics: string[] }[] = [];

async function seedSessions() {
  if (sessions.length === 0) {
    console.log("No HotNets sessions to seed — awaiting Sep 24, 2026 notification");
    return;
  }

  const { data: conf } = await supabase
    .from("conferences")
    .select("id")
    .eq("abbreviation", ABBREVIATION)
    .ilike("name", `%${YEAR}%`)
    .limit(1)
    .single();

  if (!conf) {
    console.error(`Conference "${ABBREVIATION}" not found — run seed-conferences.ts first`);
    process.exit(1);
  }

  const { data: existing } = await supabase
    .from("conference_sessions")
    .select("title")
    .eq("conference_id", conf.id);

  const existingTitles = new Set((existing ?? []).map((s) => s.title));
  const newSessions = sessions.filter((s) => !existingTitles.has(s.title));

  if (newSessions.length === 0) {
    console.log("All HotNets sessions already exist");
    return;
  }

  const rows = newSessions.map((s) => ({
    conference_id: conf.id,
    title: s.title,
    authors: s.authors,
    affiliations: s.affiliations,
    topics: s.topics,
    url: null,
  }));

  const { error } = await supabase.from("conference_sessions").insert(rows);
  if (error) {
    console.error("Insert error:", error.message);
  } else {
    console.log(`Inserted ${rows.length} sessions for ${ABBREVIATION}`);
  }
}

seedSessions();
