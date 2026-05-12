import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ABBREVIATION = "USENIX Security";
const YEAR = "2026";

// Cycle 1 accepted papers
const sessions = [
  {
    title: "Zero Knowledge (About) Encryption: A Comparative Security Analysis of Three Cloud-based Password Managers",
    authors: ["Matteo Scarlata", "Giovanni Torrisi", "Matilda Backendal", "Kenneth Paterson"],
    affiliations: ["ETH Zurich"],
    topics: ["protocol-security"],
  },
  {
    title: "Analyzing the WebRTC Ecosystem and Breaking Authentication in DTLS-SRTP",
    authors: [],
    affiliations: ["ETH Zurich"],
    topics: ["protocol-security", "side-channels"],
  },
  {
    title: "Hop: A Modern Transport and Remote Access Protocol",
    authors: [],
    affiliations: [],
    topics: ["protocol-security"],
  },
  {
    title: "LPG: Location Privacy for Direct-to-Cell LEO Satellite Networks",
    authors: [],
    affiliations: [],
    topics: ["privacy-anonymity", "protocol-security"],
  },
  {
    title: "SignalCD: End-to-End Encrypted Collaborative Documents",
    authors: [],
    affiliations: [],
    topics: ["privacy-anonymity", "protocol-security"],
  },
  {
    title: "SoK: PHILTER — Uncovering Security and Functional Gaps in AI-based Phishing Website Detection Literature via an LLM-based Reasoning Framework",
    authors: ["Mahbub Alam", "Muhammad Lutfor Rahman", "Sonjoy Kumar Paul", "Amy W. Hays", "Aftab Hussain", "Md Imanul Huq", "Nitesh Saxena"],
    affiliations: ["Texas A&M University"],
    topics: ["protocol-security"],
  },
  {
    title: "SMASH: Scalable Maliciously Secure Hybrid MPC Framework",
    authors: [],
    affiliations: [],
    topics: ["privacy-anonymity", "protocol-security"],
  },
  {
    title: "Heli: Lightweight Aggregate Statistics with Asymmetric Server Costs",
    authors: [],
    affiliations: [],
    topics: ["privacy-anonymity"],
  },
  {
    title: "Interpolation-Based Optimization for Enforcing lp-Norm Metric Differential Privacy",
    authors: [],
    affiliations: [],
    topics: ["privacy-anonymity"],
  },
  {
    title: "Imitative Membership Inference Attack (IMIA)",
    authors: ["Yunlv Lv", "Rui Zhang", "Zhiyuan Zhang", "Ziyi Wan"],
    affiliations: [],
    topics: ["privacy-anonymity", "side-channels"],
  },
  {
    title: "AIOpsDoom: Security Analysis of LLM-based AIOps Agents",
    authors: [],
    affiliations: [],
    topics: ["protocol-security", "side-channels"],
  },
  {
    title: "United We Defend: Collaborative Membership Inference Defenses in Federated Learning",
    authors: [],
    affiliations: ["Hong Kong Polytechnic University"],
    topics: ["privacy-anonymity"],
  },
  {
    title: "The Prompt Stealing Fallacy: Rethinking Metrics, Attacks, and Defenses",
    authors: [],
    affiliations: ["Hong Kong Polytechnic University"],
    topics: ["privacy-anonymity", "side-channels"],
  },
  {
    title: "Mirai Botnet Evolution: From Simple Tools to DDoS-for-Hire Platforms",
    authors: [],
    affiliations: [],
    topics: ["ddos-defense"],
  },
  {
    title: "Clinician Security Perspectives in Healthcare",
    authors: [],
    affiliations: [],
    topics: ["protocol-security"],
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
    console.log("All USENIX Security sessions already exist");
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
