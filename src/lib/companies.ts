function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const COMPANY_KEYWORDS: { slug: string; keywords: string[] }[] = [
  { slug: "cisco", keywords: ["cisco"] },
  { slug: "google", keywords: ["google", "alphabet", "gcp"] },
  { slug: "ericsson", keywords: ["ericsson"] },
  { slug: "nokia", keywords: ["nokia"] },
  { slug: "aws", keywords: ["aws", "amazon web services"] },
  { slug: "azure", keywords: ["azure"] },
  { slug: "microsoft", keywords: ["microsoft"] },
  { slug: "openai", keywords: ["openai"] },
  { slug: "anthropic", keywords: ["anthropic"] },
  { slug: "nvidia", keywords: ["nvidia"] },
  { slug: "meta", keywords: ["meta", "facebook"] },
  { slug: "micron", keywords: ["micron"] },
  { slug: "broadcom", keywords: ["broadcom"] },
  { slug: "intel", keywords: ["intel"] },
  { slug: "ibm", keywords: ["ibm"] },
  { slug: "huawei", keywords: ["huawei"] },
  { slug: "cloudflare", keywords: ["cloudflare"] },
  { slug: "apple", keywords: ["apple"] },
  { slug: "amd", keywords: ["amd"] },
  { slug: "tencent", keywords: ["tencent"] },
  { slug: "alibaba", keywords: ["alibaba"] },
  { slug: "baidu", keywords: ["baidu"] },
  { slug: "bytedance", keywords: ["bytedance", "tiktok"] },
];

export function inferCompanies(text: string): string[] {
  return COMPANY_KEYWORDS
    .filter((c) => c.keywords.some((k) => {
      try { return new RegExp(`\\b${escapeRegExp(k)}\\b`, "i").test(text); } catch { return false; }
    }))
    .map((c) => c.slug)
    .sort();
}
