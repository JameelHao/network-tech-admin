/**
 * Map arXiv categories and keyword patterns to project topic slugs.
 */
import { TOPICS } from "./topics";
import { createClient } from "@/lib/supabase/server";

/** Fetch currently valid topic slugs from the database */
export async function getValidTopicSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("admin_topics").select("slug");
  if (data && data.length > 0) return data.map((r: { slug: string }) => r.slug);
  // Fallback to hardcoded list if DB is empty
  return TOPICS.map((t) => t.slug);
}

/** arXiv category → likely project topic slugs */
const ARXIV_CATEGORY_MAP: Record<string, string[]> = {
  "cs.NI": ["dc-networking", "transport-protocols", "internet-measure", "programmable-net", "sdn-nfv", "congestion-ctrl", "traffic-analysis", "network-monitoring", "network-observability", "high-speed-networking", "os-network-stack"],
  "cs.AI": ["network-ai", "machine-learning"],
  "cs.DC": ["distributed-sys", "cloud-infra", "hpc", "parallel-computing", "storage-net"],
  "cs.PF": ["optimization", "traffic-analysis", "network-monitoring", "high-speed-networking"],
  "cs.LG": ["machine-learning", "network-ai", "optimization"],
  "cs.CR": ["protocol-security", "ddos-defense", "privacy-anonymity", "side-channels", "zero-trust", "sase-sse"],
  "cs.IT": ["mobile-wireless", "5g-6g", "satellite-leo", "quantum-networking", "optimization"],
  "cs.SY": ["distributed-sys", "cloud-infra", "edge-computing", "network-monitoring"],
  "cs.MM": ["mobile-wireless", "traffic-analysis"],
  "cs.DS": ["optimization", "distributed-sys", "hpc"],
  "cs.SE": ["programmable-net", "sdn-nfv", "intent-based-networking"],
};

/** Keyword patterns for title/abstract matching → topic slug improvements */
export const TOPIC_KEYWORD_RULES: { topic: string; patterns: RegExp[] }[] = [
  { topic: "dc-networking",         patterns: [/data\s*center/i, /dcn\b/i, /dc\s+networking/i] },
  { topic: "transport-protocols",   patterns: [/tcp\b/i, /quic\b/i, /transport\s+protocol/i, /congestion\s+control/i, /packet\s+loss/i] },
  { topic: "programmable-net",      patterns: [/p4\b/i, /programmable\s+(data\s*plane|network|switch)/i, /openflow/i] },
  { topic: "sdn-nfv",               patterns: [/sdn\b/i, /nfv\b/i, /software.defined\s+network/i, /network\s+function\s+virtual/i, /network\s+slicing/i] },
  { topic: "congestion-ctrl",       patterns: [/congestion\s+control/i, /bbr\b/i, /cubic\b/i, /reno\b/i, /tcp\s+.*\s+performance/i] },
  { topic: "internet-measure",      patterns: [/internet\s+measure/i, /network\s+measure/i, /latency\s+measure/i, /bandwidth\s+estimat/i, /active\s+probe/i, /passive\s+measure/i] },
  { topic: "traffic-analysis",      patterns: [/traffic\s+(analysis|classification|predict)/i, /packet\s+classification/i, /flow\s+classif/i, /traffic\s+generat/i] },
  { topic: "dns-bgp",               patterns: [/dns\b/i, /bgp\b/i, /border\s+gateway/i, /domain\s+name\s+system/i, /anycast/i] },
  { topic: "network-monitoring",    patterns: [/network\s+monitor/i, /telemetry/i, /snmp\b/i, /netflow/i, /sflow/i, /packet\s+capture/i] },
  { topic: "network-observability", patterns: [/observability/i, /tracing\b/i, /distributed\s+tracing/i, /opentelemetry/i] },
  { topic: "ddos-defense",          patterns: [/ddos\b/i, /denial\s+of\s+service/i, /dos\s+attack/i, /amplification\s+attack/i] },
  { topic: "protocol-security",     patterns: [/protocol\s+security/i, /tls\b/i, /https?\b/i, /ssl\b/i, /encrypt/i, /vpn\b/i, /ipsec/i, /wireguard/i] },
  { topic: "privacy-anonymity",     patterns: [/privacy/i, /anonymity/i, /tor\b/i, /differential\s+privacy/i, /onion\s+routing/i] },
  { topic: "side-channels",         patterns: [/side\s+channel/i, /timing\s+attack/i, /spectre/i, /meltdown/i, /covert\s+channel/i] },
  { topic: "zero-trust",            patterns: [/zero\s+trust/i, /zero.trust/i] },
  { topic: "sase-sse",              patterns: [/sase\b/i, /sse\b(?!\s)/i, /secure\s+access\s+service\s+edge/i] },
  { topic: "edge-computing",        patterns: [/edge\s+(comput|server|node)/i, /mobile\s+edge/i, /mec\b/i, /fog\s+comput/i] },
  { topic: "network-ai",            patterns: [/reinforcement\s+learning.*network/i, /network.*reinforcement\s+learning/i, /rl.*network/i, /network.*rl\b/i, /deep\s+learning.*network/i, /dnn.*network/i, /neural\s+network.*(?:packet|traffic|rout)/i, /machine\s+learning.*network/i] },
  { topic: "machine-learning",      patterns: [/deep\s+learning/i, /neural\s+network/i, /machine\s+learning/i, /transformer/i, /attention\s+mechanism/i, /llm\b/i, /large\s+language\s+model/i, /foundation\s+model/i] },
  { topic: "optimization",          patterns: [/optimization/i, /scheduling\b/i, /load\s+balanc/i, /routing\s+algorithm/i, /resource\s+allocat/i] },
  { topic: "ai-networking",         patterns: [/ai.*network|network.*ai\b/i, /ml.*network|network.*ml\b/i] },
  { topic: "network-digital-twin",  patterns: [/digital\s+twin/i] },
  { topic: "intent-based-networking", patterns: [/intent.based\s+network/i, /ibn\b(?!\s)/i] },
  { topic: "satellite-leo",         patterns: [/satellite/i, /leo\s+network/i, /starlink/i, /low.earth\s+orbit/i] },
  { topic: "quantum-networking",    patterns: [/quantum/i] },
  { topic: "5g-6g",                 patterns: [/5g\b/i, /6g\b/i, /nr\s+(?:cell|access|network)/i, /new\s+radio/i, /b5g\b/i, /beyond\s+5g/i] },
  { topic: "mobile-wireless",       patterns: [/mobile\s+network/i, /wireless\s+network/i, /wifi\b/i, /ieee\s+802\.11/i, /lte\s+(?:a|advanced)?/i, /mmwave/i, /mimo\b/i, /beamform/i, /handover/i, /cellular/i] },
  { topic: "ebpf-xdp",              patterns: [/ebpf\b/i, /xdp\b/i, /bpf\b(?!\s)/i] },
  { topic: "distributed-sys",       patterns: [/distributed\s+system/i, /consensus\b/i, /raft\b/i, /paxos\b/i, /byzantine/i, /replication/i] },
  { topic: "storage-net",           patterns: [/storage\s+network/i, /nvme/i, /rdma\b/i, /roce\b/i, /fibre\s+channel/i, /iscsi/i] },
  { topic: "os-network-stack",      patterns: [/kernel.*network/i, /network\s+stack/i, /socket\b/i, /tcp\/ip\s+stack/i, /xdp\b/i, /dpdk\b/i, /af_xdp/i] },
  { topic: "cloud-infra",           patterns: [/cloud\s+(infra|comput|platform)/i, /aws\b/i, /azure\b/i, /gcp\b/i, /kubernetes/i, /container/i, /serverless/i, /virtual\s+machine/i, /vm\s+migrat/i] },
  { topic: "hpc",                   patterns: [/hpc\b/i, /high.performance\s+(comput|network)/i, /supercomput/i, /mpi\b/i, /infiniband/i] },
  { topic: "high-speed-networking", patterns: [/high.speed\s+network/i, /100g\b/i, /400g\b/i, /25g\b/i, /40g\b/i, /100\s*g\s+ethernet/i, /dwdm\b/i, /optical\s+network/i] },
  { topic: "parallel-computing",    patterns: [/parallel\s+comput/i, /gpu\s+network/i, /all.reduce/i, /ring.*allreduce/i] },
];

type TopicScore = { slug: string; score: number };

export function inferPaperTopics(arxivCategories: string[], title: string, abstract: string | null, validSlugs?: string[], limit?: number): string[] {
  const allowed = new Set(validSlugs ?? TOPICS.map((t) => t.slug));
  const scores = new Map<string, number>();

  // arXiv category match: base +1
  for (const cat of arxivCategories) {
    const mapped = ARXIV_CATEGORY_MAP[cat];
    if (mapped) {
      for (const t of mapped) {
        if (allowed.has(t)) {
          scores.set(t, (scores.get(t) ?? 0) + 1);
        }
      }
    }
  }

  // Keyword matching: score per matched pattern
  // Title match = +3, abstract match = +1 per pattern
  for (const rule of TOPIC_KEYWORD_RULES) {
    if (!allowed.has(rule.topic)) continue;
    let matched = false;
    for (const p of rule.patterns) {
      if (p.test(title)) {
        scores.set(rule.topic, (scores.get(rule.topic) ?? 0) + 3);
        matched = true;
      } else if (abstract && p.test(abstract)) {
        scores.set(rule.topic, (scores.get(rule.topic) ?? 0) + 1);
        matched = true;
      }
    }
  }

  // Sort descending by score, take top N
  const sorted = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => slug);

  return limit && limit > 0 ? sorted.slice(0, limit) : sorted;
}

/** Async variant — fetches valid slugs from DB before inferring */
export async function inferPaperTopicsDynamic(
  arxivCategories: string[],
  title: string,
  abstract: string | null,
  limit?: number,
): Promise<string[]> {
  const slugs = await getValidTopicSlugs();
  return inferPaperTopics(arxivCategories, title, abstract, slugs, limit);
}
