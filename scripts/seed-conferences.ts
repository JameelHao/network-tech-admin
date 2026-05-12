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
    topics: ["dc-networking", "transport-protocols", "sdn-nfv"],
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
    topics: ["dc-networking", "distributed-sys", "cloud-infra"],
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
    topics: ["dc-networking", "transport-protocols", "mobile-wireless", "congestion-ctrl"],
  },
  {
    name: "ACM IMC 2026",
    abbreviation: "IMC",
    url: "https://conferences.sigcomm.org/imc/2026/",
    location: "Karlsruhe, Germany",
    start_date: "2026-11-03",
    end_date: "2026-11-06",
    category: "measurement",
    tier: "top",
    topics: ["internet-measure", "traffic-analysis", "dns-bgp"],
  },
  {
    name: "ACM MobiCom 2026",
    abbreviation: "MobiCom",
    url: "https://www.sigmobile.org/mobicom/2026/",
    location: "Austin, TX, USA",
    start_date: "2026-10-26",
    end_date: "2026-10-30",
    category: "network-systems",
    tier: "top",
    topics: ["mobile-wireless", "5g-6g", "edge-computing"],
  },
  {
    name: "ACM CoNEXT 2026",
    abbreviation: "CoNEXT",
    url: "https://conferences.sigcomm.org/co-next/2026/",
    location: "Utrecht, The Netherlands",
    start_date: "2026-12-07",
    end_date: "2026-12-11",
    category: "network-systems",
    tier: "top",
    topics: ["transport-protocols", "edge-computing", "network-ai", "sdn-nfv"],
  },
  {
    name: "ACM HotNets 2026",
    abbreviation: "HotNets",
    url: "https://conferences.sigcomm.org/hotnets/2026/",
    location: "Salt Lake City, UT, USA",
    start_date: "2026-11-16",
    end_date: "2026-11-17",
    category: "emerging",
    tier: "workshop",
    topics: ["dc-networking", "programmable-net", "network-ai", "congestion-ctrl"],
  },
  {
    name: "ACM SIGOPS ATC 2026",
    abbreviation: "ATC",
    url: "https://sigops.org/s/conferences/atc/2026/",
    location: "Hong Kong",
    start_date: "2026-11-15",
    end_date: "2026-11-18",
    category: "infrastructure",
    tier: "top",
    topics: ["distributed-sys", "cloud-infra", "os-network-stack", "ebpf-xdp"],
  },
  {
    name: "USENIX OSDI 2026",
    abbreviation: "OSDI",
    url: "https://www.usenix.org/conference/osdi26",
    location: "Seattle, WA, USA",
    start_date: "2026-07-13",
    end_date: "2026-07-15",
    category: "infrastructure",
    tier: "top",
    topics: ["distributed-sys", "os-network-stack", "storage-net", "cloud-infra"],
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
    topics: ["protocol-security", "privacy-anonymity", "side-channels", "ddos-defense"],
  },
  {
    name: "ACM CCS 2026",
    abbreviation: "CCS",
    url: "https://www.sigsac.org/ccs/CCS2026/",
    location: "The Hague, The Netherlands",
    start_date: "2026-11-15",
    end_date: "2026-11-19",
    category: "security",
    tier: "top",
    topics: ["protocol-security", "privacy-anonymity", "side-channels"],
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
    topics: ["ddos-defense", "protocol-security", "privacy-anonymity", "dns-bgp"],
  },
  {
    name: "SC 2026 (Supercomputing)",
    abbreviation: "SC",
    url: "https://sc26.supercomputing.org/",
    location: "Chicago, IL, USA",
    start_date: "2026-11-15",
    end_date: "2026-11-20",
    category: "infrastructure",
    tier: "top",
    topics: ["hpc", "high-speed-networking", "parallel-computing"],
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
    topics: ["network-ai", "machine-learning", "optimization"],
  },
  {
    name: "ICML 2026",
    abbreviation: "ICML",
    url: "https://icml.cc/Conferences/2026",
    location: "Seoul, South Korea",
    start_date: "2026-07-06",
    end_date: "2026-07-11",
    category: "emerging",
    tier: "top",
    topics: ["machine-learning", "network-ai", "optimization"],
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
    topics: ["distributed-sys", "os-network-stack", "cloud-infra", "ebpf-xdp"],
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
    topics: ["sdn-nfv", "programmable-net", "network-monitoring"],
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
    topics: ["protocol-security", "side-channels", "privacy-anonymity", "ddos-defense"],
  },
  {
    name: "DPDK Summit 2026",
    abbreviation: "DPDK Summit",
    url: "https://events.linuxfoundation.org/dpdk-summit/",
    location: "Stockholm, Sweden",
    start_date: "2026-05-12",
    end_date: "2026-05-13",
    category: "infrastructure",
    tier: "workshop",
    topics: ["ebpf-xdp", "programmable-net", "high-speed-networking", "os-network-stack", "cloud-infra"],
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
