import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ABBREVIATION = "SIGCOMM";

// 11 workshops + 2 tutorials confirmed; main track papers (~30-35) pending publication
const sessions = [
  {
    title: "[Workshop] Networks for AI Computing (NAIC)",
    authors: [],
    affiliations: [],
    topics: ["dc-networking", "network-ai"],
  },
  {
    title: "[Workshop] LEO Networking and Communication (LEO-NET)",
    authors: [],
    affiliations: [],
    topics: ["transport-protocols", "dc-networking"],
  },
  {
    title: "[Workshop] Formal Methods Aided Network Operation (FMANO)",
    authors: [],
    affiliations: [],
    topics: ["sdn-nfv", "network-monitoring"],
  },
  {
    title: "[Workshop] eBPF and Kernel Extensions",
    authors: [],
    affiliations: [],
    topics: ["ebpf-xdp", "programmable-net"],
  },
  {
    title: "[Workshop] Emerging Multimedia Systems (EMS)",
    authors: [],
    affiliations: [],
    topics: ["transport-protocols", "dc-networking"],
  },
  {
    title: "[Workshop] Memory-Semantic Networking for AI-Scale Systems (MemNetAI)",
    authors: [],
    affiliations: [],
    topics: ["dc-networking", "high-speed-networking"],
  },
  {
    title: "[Workshop] Memory, Systems and Interconnect Co-design for AI (MOSAIC)",
    authors: [],
    affiliations: [],
    topics: ["dc-networking", "high-speed-networking", "network-ai"],
  },
  {
    title: "[Workshop] Negative Results in Network Measurements (NetNeg)",
    authors: [],
    affiliations: [],
    topics: ["internet-measure", "network-monitoring"],
  },
  {
    title: "[Workshop] Next-Generation Network Observability (NGNO)",
    authors: [],
    affiliations: [],
    topics: ["network-monitoring", "programmable-net"],
  },
  {
    title: "[Workshop] Open Research Infrastructures and Toolkits for 6G (OpenRIT6G)",
    authors: [],
    affiliations: [],
    topics: ["5g-6g", "programmable-net"],
  },
  {
    title: "[Workshop] Quantum Networks and Distributed Quantum Computing (QuNet)",
    authors: [],
    affiliations: [],
    topics: ["dc-networking", "distributed-sys"],
  },
  {
    title: "[Tutorial] BPFChain — Building Safe Multi-Program eBPF Environments",
    authors: [],
    affiliations: [],
    topics: ["ebpf-xdp", "programmable-net"],
  },
  {
    title: "[Tutorial] NIO-VE: A View from the Edge",
    authors: [],
    affiliations: [],
    topics: ["edge-computing", "dc-networking"],
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
    console.log("All SIGCOMM sessions already exist");
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
