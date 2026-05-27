export type FeedItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type FeedConfig = {
  url: string;
  vendor: string;
  category: "saas" | "platform" | "tool";
  keywords: string[];
  site_url?: string;
};

export const FEEDS: FeedConfig[] = [
  {
    url: "https://aws.amazon.com/about-aws/whats-new/recent/feed/",
    vendor: "aws",
    category: "platform",
    site_url: "https://aws.amazon.com",
    keywords: [
      "vpc", "cdn", "cloudfront", "load balancer", "gateway",
      "transit", "route53", "route 53", "direct connect", "global accelerator",
      "elastic ip", "privatelink", "elb", "alb", "nlb",
      "vpn", "firewall", "waf", "dns",
    ],
  },
  // Azure feed moved; old https://azurecomcdn.azureedge.net/en-us/updates/feed/ dead
  {
    url: "https://cloud.google.com/feeds/gcp-release-notes.xml",
    vendor: "gcp",
    category: "platform",
    site_url: "https://cloud.google.com",
    keywords: [
      "vpc", "cdn", "cloud armor", "load balancing", "interconnect",
      "cloud dns", "cloud nat", "cloud vpn", "cloud router", "network service tiers",
      "firewall", "ddos",
    ],
  },
  {
    url: "https://blog.cloudflare.com/rss/",
    vendor: "cloudflare",
    category: "saas",
    site_url: "https://blog.cloudflare.com",
    keywords: [],
  },
  {
    url: "https://blogs.nvidia.com/feed/",
    vendor: "nvidia",
    category: "platform",
    site_url: "https://www.nvidia.com",
    keywords: [
      "dpdk", "rdma", "bluefield", "connectx", "infiniband", "spectrum",
      "networking", "data processing unit", "smartnic",
    ],
  },
  {
    url: "https://engineering.fb.com/feed/",
    vendor: "meta",
    category: "platform",
    site_url: "https://meta.com",
    keywords: [
      "open compute", "wifi", "terragraph", "evenstar", "open ran",
      "telecom", "subsea", "network", "connectivity",
    ],
  },
  {
    url: "https://blogs.cisco.com/feed",
    vendor: "cisco",
    category: "platform",
    site_url: "https://www.cisco.com",
    keywords: [
      "router", "switch", "catalyst", "nexus", "ise", "firepower", "meraki",
      "sd-wan", "sdwan", "vpn", "firewall", "dna center", "aci",
      "networking", "vxlan", "evpn", "segment routing", "ios xe", "nx-os",
      "webex", "collaboration", "security", "zero trust", "sase",
    ],
  },
  {
    url: "https://www.ericsson.com/en/pressreleases/feed",
    vendor: "ericsson",
    category: "platform",
    site_url: "https://www.ericsson.com",
    keywords: [
      "5g", "ran", "radio access", "core network", "ims", "cloud native",
      "network slicing", "edge", "oss", "bss", "transport", "fronthaul",
      "midhaul", "backhaul", "cloud ran", "open network", "network",
    ],
  },
  {
    url: "https://www.nokia.com/blog/feed/",
    vendor: "nokia",
    category: "platform",
    site_url: "https://www.nokia.com",
    keywords: [
      "5g", "ran", "optical", "ip routing", "network", "cloud",
      "data center", "fiber", "broadband", "bell labs",
    ],
  },
  {
    url: "https://azurecomcdn.azureedge.net/en-us/updates/feed/",
    vendor: "azure",
    category: "platform",
    site_url: "https://azure.microsoft.com",
    keywords: [
      "vnet", "vpn", "expressroute", "load balancer", "application gateway",
      "cdn", "front door", "traffic manager", "dns", "firewall",
      "ddos", "bastion", "private link", "network watcher", "waf",
      "virtual wan", "network",
    ],
  },
];

export const TOPIC_KEYWORDS: [RegExp, string][] = [
  [/\b(vpc|vnet|transit|private\s?link|direct\s?connect|expressroute|interconnect|cloud\s?router|network\s?service)\b/i, "cloud-infra"],
  [/\b(cdn|cloudfront|front\s?door|cloud\s?cdn|edge|cache|acceleration)\b/i, "edge-computing"],
  [/\b(load\s?balanc|elb|alb|nlb|gateway|application\s?gateway|traffic\s?manager|global\s?accelerator)\b/i, "cloud-infra"],
  [/\b(firewall|waf|shield|armor|ddos)\b/i, "ddos-defense"],
  [/\b(zero\s?trust|iam|identity|access\s?management|sase)\b/i, "zero-trust"],
  [/\b(dns|route\s?53|cloud\s?dns)\b/i, "dns-bgp"],
  [/\b(monitor\w*|observab\w*|telemetry|flow\s?log)\b/i, "network-monitoring"],
  [/\b(5g|wireless|mobile\s?network)\b/i, "5g-6g"],
  [/\b(satellite|leo|starlink)\b/i, "satellite-leo"],
  [/\b(vpn|tunnel|ipsec|wireguard)\b/i, "protocol-security"],
  [/\b(ebpf|xdp|dpdk)\b/i, "ebpf-xdp"],
  [/\b(sdn|nfv|openflow)\b/i, "sdn-nfv"],
];

export function extractTag(content: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = content.match(regex);
  if (match) return match[1];

  const selfClosing = new RegExp(`<${tag}[^>]*href=["']([^"']+)["']`, "i");
  const scMatch = content.match(selfClosing);
  if (scMatch) return scMatch[1];

  return "";
}

export function cleanHTML(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s+/g, " ")
    .trim();
}

export function parseItems(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/g;

  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const raw = match[1];
    const title = cleanHTML(extractTag(raw, "title"));
    if (!title) continue;

    const link = cleanHTML(extractTag(raw, "link"));
    const description = cleanHTML(
      extractTag(raw, "description") || extractTag(raw, "summary") || extractTag(raw, "content"),
    );
    const pubDate =
      extractTag(raw, "pubDate") || extractTag(raw, "published") || extractTag(raw, "updated");

    items.push({ title, link, description, pubDate: pubDate || new Date().toISOString() });
  }

  return items;
}

export function matchesNetworking(item: FeedItem, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const text = (item.title + " " + item.description).toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

export function mapTopics(item: FeedItem): string[] {
  const text = item.title + " " + item.description;
  const topics = new Set<string>();

  for (const [regex, slug] of TOPIC_KEYWORDS) {
    if (regex.test(text)) topics.add(slug);
  }

  if (topics.size === 0) topics.add("cloud-infra");

  return Array.from(topics).sort();
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}
