export type TopicCategory = "network-systems" | "measurement" | "security" | "emerging" | "infrastructure";

export type TopicDef = {
  slug: string;
  category: TopicCategory;
  en: string;
  zh: string;
};

export const TOPIC_CATEGORIES: Record<TopicCategory, { en: string; zh: string; color: string }> = {
  "network-systems":  { en: "Network Systems",        zh: "网络系统",     color: "navy" },
  "measurement":      { en: "Measurement & Analysis", zh: "网络测量",     color: "cobalt" },
  "security":         { en: "Network Security",       zh: "网络安全",     color: "rust" },
  "emerging":         { en: "Emerging Networks",      zh: "新兴网络",     color: "moss" },
  "infrastructure":   { en: "Systems Infrastructure", zh: "系统基础设施", color: "amber" },
};

export const TOPICS: TopicDef[] = [
  // Network Systems
  { slug: "dc-networking",       category: "network-systems",  en: "Data Center Networking",   zh: "数据中心网络" },
  { slug: "transport-protocols", category: "network-systems",  en: "Transport Protocols",      zh: "传输协议" },
  { slug: "programmable-net",    category: "network-systems",  en: "Programmable Networks",    zh: "可编程网络" },
  { slug: "sdn-nfv",            category: "network-systems",  en: "SDN/NFV",                  zh: "SDN/NFV" },
  { slug: "congestion-ctrl",    category: "network-systems",  en: "Congestion Control",       zh: "拥塞控制" },

  // Measurement & Analysis
  { slug: "internet-measure",      category: "measurement",      en: "Internet Measurement",     zh: "互联网测量" },
  { slug: "traffic-analysis",      category: "measurement",      en: "Traffic Analysis",         zh: "流量分析" },
  { slug: "dns-bgp",               category: "measurement",      en: "DNS/BGP Analysis",         zh: "DNS/BGP分析" },
  { slug: "network-monitoring",    category: "measurement",      en: "Network Monitoring",       zh: "网络监控" },
  { slug: "network-observability", category: "measurement",      en: "Network Observability",    zh: "网络可观测性" },

  // Network Security
  { slug: "ddos-defense",       category: "security",         en: "DDoS Defense",             zh: "DDoS防御" },
  { slug: "protocol-security",  category: "security",         en: "Protocol Security",        zh: "协议安全" },
  { slug: "privacy-anonymity",  category: "security",         en: "Privacy & Anonymity",      zh: "隐私与匿名" },
  { slug: "side-channels",      category: "security",         en: "Side Channels",            zh: "侧信道攻击" },
  { slug: "zero-trust",         category: "security",         en: "Zero Trust Architecture",  zh: "零信任架构" },
  { slug: "sase-sse",           category: "security",         en: "SASE/SSE",                 zh: "SASE/SSE" },

  // Emerging Networks
  { slug: "edge-computing",            category: "emerging",         en: "Edge Computing",              zh: "边缘计算" },
  { slug: "network-ai",                category: "emerging",         en: "Network Intelligence",        zh: "网络AI/ML" },
  { slug: "machine-learning",          category: "emerging",         en: "Machine Learning",            zh: "机器学习" },
  { slug: "optimization",              category: "emerging",         en: "Optimization",                zh: "优化" },
  { slug: "ai-networking",             category: "emerging",         en: "AI for Networking",           zh: "AI驱动网络" },
  { slug: "network-digital-twin",      category: "emerging",         en: "Network Digital Twin",        zh: "网络数字孪生" },
  { slug: "intent-based-networking",   category: "emerging",         en: "Intent-Based Networking",     zh: "意图驱动网络" },
  { slug: "satellite-leo",             category: "emerging",         en: "Satellite/LEO Networks",      zh: "卫星/LEO网络" },
  { slug: "quantum-networking",        category: "emerging",         en: "Quantum Networking",          zh: "量子网络" },
  { slug: "5g-6g",                     category: "emerging",         en: "5G/6G",                       zh: "5G/6G" },
  { slug: "mobile-wireless",           category: "emerging",         en: "Mobile & Wireless",           zh: "移动与无线" },
  { slug: "ebpf-xdp",                  category: "emerging",         en: "eBPF/XDP",                    zh: "eBPF/XDP" },

  // Systems Infrastructure
  { slug: "distributed-sys",    category: "infrastructure",   en: "Distributed Systems",      zh: "分布式系统" },
  { slug: "storage-net",        category: "infrastructure",   en: "Storage Networks",         zh: "存储网络" },
  { slug: "os-network-stack",   category: "infrastructure",   en: "OS Network Stack",         zh: "OS网络栈" },
  { slug: "cloud-infra",        category: "infrastructure",   en: "Cloud Infrastructure",     zh: "云基础设施" },
  { slug: "hpc",                category: "infrastructure",   en: "HPC",                      zh: "高性能计算" },
  { slug: "high-speed-networking", category: "infrastructure", en: "High-Speed Networking",   zh: "高速网络" },
  { slug: "parallel-computing", category: "infrastructure",   en: "Parallel Computing",       zh: "并行计算" },
];

export const TOPIC_MAP = Object.fromEntries(TOPICS.map((t) => [t.slug, t])) as Record<string, TopicDef>;

export type ConferenceTier = "top" | "good" | "workshop";

export const CONFERENCE_TIERS: Record<ConferenceTier, { en: string; zh: string }> = {
  top:      { en: "Top",      zh: "顶会" },
  good:     { en: "Good",     zh: "优质" },
  workshop: { en: "Workshop", zh: "研讨会" },
};

export function getTopicLabel(slug: string, lang: "en" | "zh"): string {
  return TOPIC_MAP[slug]?.[lang] ?? slug;
}

export function getTopicCategory(slug: string): TopicCategory | undefined {
  return TOPIC_MAP[slug]?.category;
}

export function getCategoryColor(category: TopicCategory): string {
  return TOPIC_CATEGORIES[category]?.color ?? "ink";
}
