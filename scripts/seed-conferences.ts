import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const conferences = [
  {
    name: "ACM SIGCOMM 2026",
    abbreviation: "SIGCOMM",
    url: "https://sigcomm.org/events/sigcomm-conference",
    location: "Barcelona, Spain",
    start_date: "2026-08-24",
    end_date: "2026-08-28",
    category: "network-systems",
    tier: "top",
    topics: ["networking", "internet architecture", "protocols"],
  },
  {
    name: "USENIX NSDI 2026",
    abbreviation: "NSDI",
    url: "https://www.usenix.org/conference/nsdi26",
    location: "Philadelphia, PA, USA",
    start_date: "2026-04-15",
    end_date: "2026-04-17",
    category: "network-systems",
    tier: "top",
    topics: ["networked systems", "distributed systems", "infrastructure"],
  },
  {
    name: "IEEE INFOCOM 2026",
    abbreviation: "INFOCOM",
    url: "https://infocom2026.ieee-infocom.org/",
    location: "London, UK",
    start_date: "2026-05-19",
    end_date: "2026-05-22",
    category: "network-systems",
    tier: "top",
    topics: ["networking", "communications", "mobile computing"],
  },
  {
    name: "ACM IMC 2026",
    abbreviation: "IMC",
    url: "https://conferences.sigcomm.org/imc/2026/",
    location: "TBD",
    start_date: "2026-10-26",
    end_date: "2026-10-28",
    category: "measurement",
    tier: "top",
    topics: ["internet measurement", "network analysis", "traffic"],
  },
  {
    name: "ACM MobiCom 2026",
    abbreviation: "MobiCom",
    url: "https://www.sigmobile.org/mobicom/2026/",
    location: "Washington, DC, USA",
    start_date: "2026-11-02",
    end_date: "2026-11-06",
    category: "network-systems",
    tier: "top",
    topics: ["mobile computing", "wireless networks", "5G/6G"],
  },
  {
    name: "ACM CoNEXT 2026",
    abbreviation: "CoNEXT",
    url: "https://conferences.sigcomm.org/co-next/2026/",
    location: "TBD",
    start_date: "2026-12-08",
    end_date: "2026-12-11",
    category: "network-systems",
    tier: "top",
    topics: ["networking", "future internet", "protocols"],
  },
  {
    name: "ACM HotNets 2026",
    abbreviation: "HotNets",
    url: "https://conferences.sigcomm.org/hotnets/2026/",
    location: "TBD",
    start_date: "2026-11-18",
    end_date: "2026-11-19",
    category: "emerging",
    tier: "workshop",
    topics: ["networking research", "emerging topics"],
  },
  {
    name: "USENIX ATC 2026",
    abbreviation: "ATC",
    url: "https://www.usenix.org/conference/atc26",
    location: "Boston, MA, USA",
    start_date: "2026-07-13",
    end_date: "2026-07-15",
    category: "infrastructure",
    tier: "top",
    topics: ["systems", "operating systems", "storage", "networking"],
  },
  {
    name: "USENIX OSDI 2026",
    abbreviation: "OSDI",
    url: "https://www.usenix.org/conference/osdi26",
    location: "Boston, MA, USA",
    start_date: "2026-07-15",
    end_date: "2026-07-17",
    category: "infrastructure",
    tier: "top",
    topics: ["operating systems", "distributed systems", "networking"],
  },
  {
    name: "IEEE Symposium on Security and Privacy 2026",
    abbreviation: "S&P",
    url: "https://www.ieee-security.org/TC/SP2026/",
    location: "San Francisco, CA, USA",
    start_date: "2026-05-18",
    end_date: "2026-05-22",
    category: "security",
    tier: "top",
    topics: ["security", "privacy", "network security"],
  },
  {
    name: "ACM CCS 2026",
    abbreviation: "CCS",
    url: "https://www.sigsac.org/ccs/CCS2026/",
    location: "TBD",
    start_date: "2026-11-09",
    end_date: "2026-11-13",
    category: "security",
    tier: "top",
    topics: ["computer security", "network security", "cryptography"],
  },
  {
    name: "NDSS 2026",
    abbreviation: "NDSS",
    url: "https://www.ndss-symposium.org/ndss2026/",
    location: "San Diego, CA, USA",
    start_date: "2026-02-23",
    end_date: "2026-02-28",
    category: "security",
    tier: "top",
    topics: ["network security", "system security"],
  },
  {
    name: "SC 2026 (Supercomputing)",
    abbreviation: "SC",
    url: "https://sc26.supercomputing.org/",
    location: "St. Louis, MO, USA",
    start_date: "2026-11-15",
    end_date: "2026-11-20",
    category: "infrastructure",
    tier: "top",
    topics: ["HPC", "high-speed networking", "parallel computing"],
  },
  {
    name: "NeurIPS 2026",
    abbreviation: "NeurIPS",
    url: "https://neurips.cc/Conferences/2026",
    location: "TBD",
    start_date: "2026-12-07",
    end_date: "2026-12-13",
    category: "emerging",
    tier: "top",
    topics: ["machine learning", "AI", "AI for networking"],
  },
  {
    name: "ICML 2026",
    abbreviation: "ICML",
    url: "https://icml.cc/Conferences/2026",
    location: "TBD",
    start_date: "2026-07-19",
    end_date: "2026-07-25",
    category: "emerging",
    tier: "top",
    topics: ["machine learning", "AI", "optimization"],
  },
  {
    name: "EuroSys 2026",
    abbreviation: "EuroSys",
    url: "https://2026.eurosys.org/",
    location: "Rotterdam, Netherlands",
    start_date: "2026-03-30",
    end_date: "2026-04-03",
    category: "infrastructure",
    tier: "top",
    topics: ["systems", "distributed systems", "cloud"],
  },
  {
    name: "ACM SOSR 2026",
    abbreviation: "SOSR",
    url: "https://conferences.sigcomm.org/sosr/2026/",
    location: "TBD",
    start_date: "2026-03-03",
    end_date: "2026-03-04",
    category: "network-systems",
    tier: "good",
    topics: ["SDN", "programmable networks", "network management"],
  },
  {
    name: "USENIX Security 2026",
    abbreviation: "USENIX Security",
    url: "https://www.usenix.org/conference/usenixsecurity26",
    location: "Seattle, WA, USA",
    start_date: "2026-08-11",
    end_date: "2026-08-13",
    category: "security",
    tier: "top",
    topics: ["security", "network security", "privacy"],
  },
];

async function seed() {
  const { data: existing } = await supabase.from("conferences").select("abbreviation");
  const existingAbbrs = new Set((existing ?? []).map((c) => c.abbreviation));

  const newConfs = conferences.filter((c) => !existingAbbrs.has(c.abbreviation));

  if (newConfs.length === 0) {
    console.log("All conferences already exist");
    return;
  }

  const { error } = await supabase.from("conferences").insert(newConfs);
  if (error) {
    console.error("Insert error:", error.message);
  } else {
    console.log(`Inserted ${newConfs.length} conferences`);
  }
}

seed();
