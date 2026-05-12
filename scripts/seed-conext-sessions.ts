import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ABBREVIATION = "CoNEXT";

// 9 Round 1 papers (PACMNET V4 CoNEXT1, Mar 2026); Round 2 (~10-15) pending Aug 2026
const sessions = [
  {
    title: "UniProxy: Breaking the Per-Flow Barrier in Multipath Proxy Design",
    authors: [],
    affiliations: [],
    topics: ["transport-protocols", "edge-computing"],
  },
  {
    title: "Energy Consumption in High-Speed Host Networking",
    authors: [],
    affiliations: [],
    topics: ["high-speed-networking", "dc-networking"],
  },
  {
    title: "Video Streaming Responsiveness",
    authors: [],
    affiliations: [],
    topics: ["transport-protocols", "network-monitoring"],
  },
  {
    title: "Joint IP–Optical Core Network Planning and Recovery",
    authors: [],
    affiliations: [],
    topics: ["high-speed-networking", "sdn-nfv"],
  },
  {
    title: "Decentralised Routing for Large-Scale LEO Satellite Constellations",
    authors: [],
    affiliations: [],
    topics: ["transport-protocols", "network-ai"],
  },
  {
    title: "Scalable Phishing Detection",
    authors: [],
    affiliations: [],
    topics: ["protocol-security", "network-monitoring"],
  },
  {
    title: "Defences Against Website Fingerprinting",
    authors: [],
    affiliations: [],
    topics: ["privacy-anonymity", "protocol-security"],
  },
  {
    title: "Cryptographic Acceleration on FPGA Platforms",
    authors: [],
    affiliations: [],
    topics: ["high-speed-networking", "protocol-security"],
  },
  {
    title: "State-Aware Synthetic Traffic Generation",
    authors: [],
    affiliations: [],
    topics: ["network-monitoring", "traffic-analysis"],
  },
];

async function seedSessions() {
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
    console.log("All CoNEXT sessions already exist");
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
