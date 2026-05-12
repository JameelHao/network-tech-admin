import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ABBREVIATION = "DPDK Summit";
const YEAR = "2026";

const sessions = [
  // Day 1 (May 12)
  {
    title: "Grout: A DPDK-Based Router",
    authors: ["Christophe Fontaine"],
    affiliations: ["Red Hat"],
    topics: ["programmable-net", "high-speed-networking"],
  },
  {
    title: "rte_flow Offload for Multi-device",
    authors: ["Dariusz Sosnowski"],
    affiliations: ["NVIDIA"],
    topics: ["high-speed-networking", "programmable-net"],
  },
  {
    title: "eBPF Verification for DPDK",
    authors: ["Alan Jowett"],
    affiliations: [],
    topics: ["ebpf-xdp", "programmable-net"],
  },
  {
    title: "Zero-Copy Transfer Between Processes",
    authors: ["Anatoly Burakov"],
    affiliations: ["Intel"],
    topics: ["high-speed-networking", "os-network-stack"],
  },
  {
    title: "DPU/XPU Crypto Offload",
    authors: ["Fan Zhang"],
    affiliations: ["Intel"],
    topics: ["high-speed-networking", "cloud-infra"],
  },
  {
    title: "K8s Routing with DPDK",
    authors: ["Robin Jarry"],
    affiliations: ["Red Hat"],
    topics: ["cloud-infra", "programmable-net"],
  },
  {
    title: "DPI Integration with DPDK",
    authors: [],
    affiliations: [],
    topics: ["high-speed-networking", "programmable-net"],
  },
  // Day 2 (May 13)
  {
    title: "RISC-V DPDK Port",
    authors: [],
    affiliations: [],
    topics: ["os-network-stack", "programmable-net"],
  },
  {
    title: "DPDK at CERN",
    authors: [],
    affiliations: ["CERN"],
    topics: ["high-speed-networking", "cloud-infra"],
  },
  {
    title: "Telco Edge with DPDK",
    authors: [],
    affiliations: ["Ericsson"],
    topics: ["cloud-infra", "high-speed-networking"],
  },
  {
    title: "DPDK CI/Testing",
    authors: [],
    affiliations: ["UNH-IOL"],
    topics: ["programmable-net"],
  },
];

async function seedSessions() {
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
    console.log("All DPDK Summit sessions already exist");
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
