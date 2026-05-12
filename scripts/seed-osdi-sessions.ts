import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ABBREVIATION = "OSDI";
const YEAR = "2026";

// 8 confirmed accepted papers; full program (~40-50 papers) pending USENIX publication
const sessions = [
  {
    title: "OpenTela: Unifying Decentralized HPC Clusters for Heterogeneous LLM Serving",
    authors: ["Xiaozhe Yao", "Youhe Jiang", "Ilia Badanin", "Qinghao Hu", "Binhang Yuan", "Eiko Yoneki", "Imanol Schlag", "Ana Klimovic"],
    affiliations: ["ETH Zurich", "University of Cambridge", "EPFL", "MIT", "HKUST"],
    topics: ["distributed-sys", "cloud-infra", "hpc"],
  },
  {
    title: "RoCE BALBOA: Service-Enhanced RDMA Offload Engine for Data Center SmartNICs",
    authors: ["Maximilian Heer", "Benjamin Ramhorst", "Yu Zhu", "Luhao Liu", "Zhiyi Hu", "Jonas Dann", "Gustavo Alonso"],
    affiliations: ["ETH Zurich"],
    topics: ["dc-networking", "high-speed-networking", "cloud-infra"],
  },
  {
    title: "Simple is Better: Multiplication May Be All You Need for LLM Request Scheduling",
    authors: ["Dingyan Zhang", "Jinbo Han", "Kaixi Zhang", "Xingda Wei", "Sijie Shen", "Chenguang Fang", "Wenyuan Yu", "Jingren Zhou", "Rong Chen"],
    affiliations: ["SJTU", "Alibaba"],
    topics: ["distributed-sys", "cloud-infra"],
  },
  {
    title: "Breaking the Reward Barrier: Accelerating Tree-of-Thought Reasoning via Speculative Exploration",
    authors: ["Meng Li"],
    affiliations: ["Peking University"],
    topics: ["distributed-sys", "cloud-infra"],
  },
  {
    title: "[Pending] Sun Yat-sen University Systems — OSDI'26",
    authors: ["Jiangsu Du", "Hongbin Zhang", "Taosheng Wei", "Zhenyi Zheng", "Jiazhi Jiang", "Kaiyi Wu", "Zhiguang Chen", "Yutong Lu"],
    affiliations: ["Sun Yat-sen University"],
    topics: ["distributed-sys", "cloud-infra"],
  },
  {
    title: "[Pending] Sun Yat-sen / HKUST Distributed Systems — OSDI'26",
    authors: ["Yapeng Jiang", "Mingyuan Gan", "Zicong Hong", "Wuhui Chen", "Junyuan Liang", "Yue Yu", "Meng Guo", "Zibin Zheng"],
    affiliations: ["Sun Yat-sen University", "HKUST", "Pengcheng Laboratory", "Qilu University of Technology"],
    topics: ["distributed-sys", "cloud-infra"],
  },
  {
    title: "[Pending] UC Berkeley / NVIDIA / UPenn / UT Austin Systems — OSDI'26",
    authors: ["Jaewan Hong", "Marcos K. Aguilera", "Vincent Liu", "Christopher J. Rossbach"],
    affiliations: ["UC Berkeley", "NVIDIA", "University of Pennsylvania", "UT Austin", "Microsoft"],
    topics: ["distributed-sys", "os-network-stack"],
  },
  {
    title: "[Pending] UC Berkeley Security/Systems — OSDI'26",
    authors: ["Ryan Cottone", "Darya Kaviani", "Conor Power", "Will Giorza", "Evelyn Koo", "Natacha Crooks", "Raluca Popa"],
    affiliations: ["UC Berkeley", "Stanford"],
    topics: ["distributed-sys", "cloud-infra"],
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
    console.log("All OSDI sessions already exist");
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
