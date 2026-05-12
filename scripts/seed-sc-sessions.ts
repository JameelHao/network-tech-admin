import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ABBREVIATION = "SC";

// 8 networking-relevant workshops; paper sessions (~60-80) pending Sep 2026
const sessions = [
  {
    title: "INDIS: Innovating the Network for Data-Intensive Science",
    authors: [],
    affiliations: [],
    topics: ["high-speed-networking", "hpc", "network-monitoring"],
  },
  {
    title: "High Performance Fabrics for AI and HPC",
    authors: [],
    affiliations: [],
    topics: ["high-speed-networking", "hpc", "dc-networking"],
  },
  {
    title: "ECHO: Edge-Cloud-HPC Operational Continuum",
    authors: [],
    affiliations: [],
    topics: ["hpc", "edge-computing", "cloud-infra"],
  },
  {
    title: "RESDIS: Resource Disaggregation",
    authors: [],
    affiliations: [],
    topics: ["hpc", "dc-networking", "high-speed-networking"],
  },
  {
    title: "Cyber Security in HPC",
    authors: [],
    affiliations: [],
    topics: ["hpc", "protocol-security"],
  },
  {
    title: "Trillion Parameter Workshop",
    authors: [],
    affiliations: [],
    topics: ["hpc", "machine-learning", "distributed-sys"],
  },
  {
    title: "EESP 2026: Energy Efficiency in Supercomputing and Networking",
    authors: [],
    affiliations: [],
    topics: ["hpc", "high-speed-networking"],
  },
  {
    title: "Sovereign AI Supercomputing Cloud",
    authors: [],
    affiliations: [],
    topics: ["hpc", "cloud-infra"],
  },
];

async function seedSessions() {
  if (sessions.length === 0) {
    console.log("No SC sessions to seed");
    return;
  }

  const { data: conf } = await supabase
    .from("conferences")
    .select("id")
    .eq("abbreviation", ABBREVIATION)
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
    console.log("All SC sessions already exist");
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
