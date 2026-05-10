import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const projects = [
  {
    name: "Cilium",
    repo_url: "https://github.com/cilium/cilium",
    description: "eBPF-based networking, security, and observability for cloud native workloads",
    language: "Go",
    topics: ["eBPF", "kubernetes", "networking", "security"],
  },
  {
    name: "Open vSwitch",
    repo_url: "https://github.com/openvswitch/ovs",
    description: "Production-quality multilayer virtual switch for Linux",
    language: "C",
    topics: ["SDN", "virtual switch", "OpenFlow"],
  },
  {
    name: "FRRouting",
    repo_url: "https://github.com/FRRouting/frr",
    description: "Free routing protocol suite (BGP, OSPF, IS-IS, etc.) for Linux/Unix",
    language: "C",
    topics: ["routing", "BGP", "OSPF", "networking"],
  },
  {
    name: "VPP (Vector Packet Processing)",
    repo_url: "https://github.com/FDio/vpp",
    description: "High-performance user-space network stack from fd.io",
    language: "C",
    topics: ["data plane", "high performance", "DPDK"],
  },
  {
    name: "Envoy",
    repo_url: "https://github.com/envoyproxy/envoy",
    description: "Cloud-native high-performance edge/middle/service proxy",
    language: "C++",
    topics: ["proxy", "service mesh", "load balancing"],
  },
  {
    name: "Katran",
    repo_url: "https://github.com/facebookincubator/katran",
    description: "High-performance layer 4 load balancer using eBPF/XDP from Meta",
    language: "C++",
    topics: ["load balancing", "eBPF", "XDP"],
  },
  {
    name: "DPDK",
    repo_url: "https://github.com/DPDK/dpdk",
    description: "Data Plane Development Kit for fast packet processing in user space",
    language: "C",
    topics: ["data plane", "high performance", "packet processing"],
  },
  {
    name: "Scapy",
    repo_url: "https://github.com/secdev/scapy",
    description: "Python-based interactive packet manipulation library",
    language: "Python",
    topics: ["packet crafting", "network analysis", "security"],
  },
  {
    name: "Istio",
    repo_url: "https://github.com/istio/istio",
    description: "Service mesh that provides traffic management, security, and observability",
    language: "Go",
    topics: ["service mesh", "kubernetes", "microservices"],
  },
  {
    name: "Calico",
    repo_url: "https://github.com/projectcalico/calico",
    description: "Cloud-native networking and network security for containers",
    language: "Go",
    topics: ["kubernetes", "networking", "security", "BGP"],
  },
  {
    name: "Netdata",
    repo_url: "https://github.com/netdata/netdata",
    description: "Real-time infrastructure monitoring and troubleshooting",
    language: "C",
    topics: ["monitoring", "observability", "infrastructure"],
  },
  {
    name: "Wireshark",
    repo_url: "https://github.com/wireshark/wireshark",
    description: "World's most popular network protocol analyzer",
    language: "C",
    topics: ["packet analysis", "protocol analysis", "debugging"],
  },
  {
    name: "SONiC",
    repo_url: "https://github.com/sonic-net/sonic-buildimage",
    description: "Software for Open Networking in the Cloud - network OS for switches",
    language: "Python",
    topics: ["network OS", "switches", "data center"],
  },
  {
    name: "P4",
    repo_url: "https://github.com/p4lang/p4c",
    description: "Reference compiler for P4 programming language for programmable data planes",
    language: "C++",
    topics: ["programmable networking", "SDN", "data plane"],
  },
  {
    name: "Mininet",
    repo_url: "https://github.com/mininet/mininet",
    description: "Instant virtual network emulator for rapid prototyping of SDN",
    language: "Python",
    topics: ["SDN", "emulation", "research"],
  },
  {
    name: "dnsmasq",
    repo_url: "https://github.com/imp/dnsmasq",
    description: "Lightweight DNS/DHCP/TFTP server for small networks",
    language: "C",
    topics: ["DNS", "DHCP", "infrastructure"],
  },
  {
    name: "Traefik",
    repo_url: "https://github.com/traefik/traefik",
    description: "Cloud-native application proxy and load balancer",
    language: "Go",
    topics: ["proxy", "load balancing", "cloud native"],
  },
  {
    name: "CoreDNS",
    repo_url: "https://github.com/coredns/coredns",
    description: "DNS server that chains plugins, default DNS in Kubernetes",
    language: "Go",
    topics: ["DNS", "kubernetes", "infrastructure"],
  },
  {
    name: "BCC (BPF Compiler Collection)",
    repo_url: "https://github.com/iovisor/bcc",
    description: "Tools for BPF-based Linux IO analysis, networking, and monitoring",
    language: "Python",
    topics: ["eBPF", "tracing", "networking", "observability"],
  },
  {
    name: "Cloudflare Workers",
    repo_url: "https://github.com/cloudflare/workerd",
    description: "JavaScript/Wasm runtime powering Cloudflare Workers edge compute",
    language: "C++",
    topics: ["edge computing", "serverless", "V8"],
  },
];

async function fetchGitHubStats(repoUrl: string) {
  const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
  if (!match) return { stars: null, last_active: null };

  try {
    const res = await fetch(`https://api.github.com/repos/${match[1]}`, {
      headers: { "User-Agent": "NetworkTechRadar/1.0" },
    });
    if (!res.ok) return { stars: null, last_active: null };
    const data = await res.json();
    return {
      stars: data.stargazers_count ?? null,
      last_active: data.pushed_at?.slice(0, 10) ?? null,
    };
  } catch {
    return { stars: null, last_active: null };
  }
}

async function seed() {
  const { data: existing } = await supabase.from("opensource").select("repo_url");
  const existingUrls = new Set((existing ?? []).map((o) => o.repo_url));

  const newProjects = projects.filter((p) => !existingUrls.has(p.repo_url));

  if (newProjects.length === 0) {
    console.log("All projects already exist");
    return;
  }

  console.log(`Fetching GitHub stats for ${newProjects.length} projects...`);

  const rows = [];
  for (const p of newProjects) {
    const stats = await fetchGitHubStats(p.repo_url);
    rows.push({ ...p, ...stats });
    await new Promise((r) => setTimeout(r, 300));
  }

  const { error } = await supabase.from("opensource").insert(rows);
  if (error) {
    console.error("Insert error:", error.message);
  } else {
    console.log(`Inserted ${rows.length} open source projects`);
  }
}

seed();
