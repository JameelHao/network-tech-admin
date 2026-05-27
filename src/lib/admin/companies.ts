export const COMPANY_COLORS: Record<string, string> = {
  cisco: "bg-blue-100 text-blue-700 border border-blue-200",
  google: "bg-red-100 text-red-700 border border-red-200",
  ericsson: "bg-orange-100 text-orange-700 border border-orange-200",
  nokia: "bg-cyan-100 text-cyan-700 border border-cyan-200",
  aws: "bg-amber-100 text-amber-700 border border-amber-200",
  azure: "bg-sky-100 text-sky-700 border border-sky-200",
  microsoft: "bg-sky-100 text-sky-700 border border-sky-200",
  openai: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  anthropic: "bg-purple-100 text-purple-700 border border-purple-200",
  nvidia: "bg-green-100 text-green-700 border border-green-200",
  meta: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  micron: "bg-teal-100 text-teal-700 border border-teal-200",
  broadcom: "bg-rose-100 text-rose-700 border border-rose-200",
  intel: "bg-blue-100 text-blue-700 border border-blue-200",
  ibm: "bg-zinc-100 text-zinc-700 border border-zinc-200",
  huawei: "bg-red-100 text-red-700 border border-red-200",
  cloudflare: "bg-orange-100 text-orange-700 border border-orange-200",
  apple: "bg-gray-100 text-gray-700 border border-gray-200",
  amd: "bg-violet-100 text-violet-700 border border-violet-200",
  tencent: "bg-blue-100 text-blue-700 border border-blue-200",
  alibaba: "bg-rose-100 text-rose-700 border border-rose-200",
  baidu: "bg-blue-100 text-blue-700 border border-blue-200",
  bytedance: "bg-cyan-100 text-cyan-700 border border-cyan-200",
};

export const COMPANY_NAMES: Record<string, string> = {
  cisco: "Cisco",
  google: "Google",
  ericsson: "Ericsson",
  nokia: "Nokia",
  aws: "AWS",
  azure: "Azure",
  microsoft: "Microsoft",
  openai: "OpenAI",
  anthropic: "Anthropic",
  nvidia: "NVIDIA",
  meta: "Meta",
  micron: "Micron",
  broadcom: "Broadcom",
  intel: "Intel",
  ibm: "IBM",
  huawei: "Huawei",
  cloudflare: "Cloudflare",
  apple: "Apple",
  amd: "AMD",
  tencent: "Tencent",
  alibaba: "Alibaba",
  baidu: "Baidu",
  bytedance: "ByteDance",
};

export const COMPANY_GITHUB_ORGS: Record<string, string[]> = {
  cisco: ["cisco"],
  google: ["google"],
  ericsson: ["ericsson"],
  nokia: ["nokia", "nokia-networks"],
  aws: ["aws"],
  azure: ["microsoft"],
  microsoft: ["microsoft"],
  openai: ["openai"],
  anthropic: ["anthropics"],
  nvidia: ["nvidia"],
  meta: ["facebook"],
  micron: ["micron"],
  broadcom: ["broadcom"],
  intel: ["intel"],
  ibm: ["IBM"],
  huawei: ["huawei"],
  cloudflare: ["cloudflare"],
  apple: ["apple"],
  amd: ["amd"],
  tencent: ["Tencent"],
  alibaba: ["alibaba"],
  baidu: ["baidu"],
  bytedance: ["bytedance"],
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function inferCompanies(text: string): string[] {
  return COMPANY_KEYWORDS
    .filter((c) => c.keywords.some((k) => {
      try { return new RegExp(`\\b${escapeRegExp(k)}\\b`, "i").test(text); } catch { return false; }
    }))
    .map((c) => c.slug)
    .sort();
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
  { slug: "broadcom", keywords: ["broadcom", "broadcom"] },
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
