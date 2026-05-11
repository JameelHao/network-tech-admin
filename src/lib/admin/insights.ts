import { createClient } from "@/lib/supabase/server";

export type ChartPoint = { name: string; value: number };

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function quarterKey(date: string): string {
  const m = parseInt(date.slice(5, 7), 10);
  const q = Math.ceil(m / 3);
  return `${date.slice(0, 4)} Q${q}`;
}

export function countByField<T extends Record<string, unknown>>(
  rows: T[],
  field: keyof T,
  limit?: number,
): ChartPoint[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const val = String(row[field] ?? "");
    if (val) counts.set(val, (counts.get(val) ?? 0) + 1);
  }
  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
  return limit ? sorted.slice(0, limit) : sorted;
}

export function countArrayField<T extends Record<string, unknown>>(
  rows: T[],
  field: keyof T,
  limit?: number,
): ChartPoint[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const arr = row[field];
    if (Array.isArray(arr)) {
      for (const item of arr) {
        const key = String(item);
        if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
  }
  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
  return limit ? sorted.slice(0, limit) : sorted;
}

export function monthlyTrend(
  rows: { date: string }[],
  months: number,
): ChartPoint[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const counts = new Map<string, number>();
  for (const k of keys) counts.set(k, 0);
  for (const row of rows) {
    const k = monthKey(row.date);
    if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return keys.map((k) => ({ name: k, value: counts.get(k) ?? 0 }));
}

// --- Paper insights ---

export async function getPaperMonthlyTrend(months = 12): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("papers")
    .select("published_date")
    .not("published_date", "is", null)
    .order("published_date", { ascending: false })
    .limit(5000);
  const rows = (data ?? []).map((d) => ({ date: d.published_date as string }));
  return monthlyTrend(rows, months);
}

export async function getPaperTopTopics(limit = 10): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("papers").select("topics").limit(5000);
  return countArrayField(data ?? [], "topics", limit);
}

export type HeatmapPoint = { topic: string; month: string; count: number };

export async function getPaperTopicHeatmap(months = 12): Promise<HeatmapPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("papers")
    .select("topics, published_date")
    .not("published_date", "is", null)
    .limit(5000);

  const topTopics = countArrayField(data ?? [], "topics", 10).map((p) => p.name);

  const now = new Date();
  const monthKeys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const counts = new Map<string, number>();
  for (const t of topTopics) {
    for (const m of monthKeys) {
      counts.set(`${t}|${m}`, 0);
    }
  }

  for (const row of data ?? []) {
    const m = monthKey((row as { published_date: string }).published_date);
    if (!monthKeys.includes(m)) continue;
    const topics = (row as { topics: string[] }).topics;
    if (!Array.isArray(topics)) continue;
    for (const t of topics) {
      if (!topTopics.includes(t)) continue;
      const key = `${t}|${m}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const result: HeatmapPoint[] = [];
  for (const [key, count] of counts) {
    const [topic, month] = key.split("|");
    result.push({ topic, month, count });
  }
  return result;
}

export async function getPaperVenueDistribution(): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("papers")
    .select("venue")
    .not("venue", "is", null)
    .limit(5000);
  return countByField(data ?? [], "venue");
}

// --- Conference insights ---

export async function getConferenceQuarterlyTrend(): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conferences")
    .select("start_date")
    .order("start_date", { ascending: true })
    .limit(2000);
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const k = quarterKey(row.start_date);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export async function getConferenceTierDistribution(): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("conferences").select("tier").limit(2000);
  return countByField(data ?? [], "tier");
}

export async function getConferenceCategoryTrend(): Promise<Record<string, unknown>[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conferences")
    .select("start_date, category")
    .order("start_date", { ascending: true })
    .limit(2000);
  const yearCat = new Map<string, Record<string, number>>();
  for (const row of data ?? []) {
    const year = row.start_date.slice(0, 4);
    if (!yearCat.has(year)) yearCat.set(year, {});
    const rec = yearCat.get(year)!;
    rec[row.category] = (rec[row.category] ?? 0) + 1;
  }
  return Array.from(yearCat.entries()).map(([year, cats]) => ({
    name: year,
    ...cats,
  }));
}

// --- Lead insights ---

export async function getLeadStageFunnel(): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("leads").select("stage").limit(5000);
  const stages = ["new", "tracking", "evaluating", "archived"];
  const counts = new Map<string, number>();
  for (const s of stages) counts.set(s, 0);
  for (const row of data ?? []) counts.set(row.stage, (counts.get(row.stage) ?? 0) + 1);
  return stages.map((s) => ({ name: s, value: counts.get(s) ?? 0 }));
}

export async function getLeadSourceDistribution(): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("leads").select("source_type").limit(5000);
  return countByField(data ?? [], "source_type");
}

export async function getLeadMonthlyTrend(months = 12): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(5000);
  const rows = (data ?? []).map((d) => ({ date: d.created_at }));
  return monthlyTrend(rows, months);
}

// --- Talent insights ---

export async function getTalentCompanyTop(limit = 10): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("talent_leads")
    .select("company")
    .not("company", "is", null)
    .limit(5000);
  return countByField(data ?? [], "company", limit);
}

export async function getTalentTopicFrequency(limit = 15): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("talent_leads").select("topics").limit(5000);
  return countArrayField(data ?? [], "topics", limit);
}

export async function getTalentStageDistribution(): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("talent_leads").select("stage").limit(5000);
  return countByField(data ?? [], "stage");
}

// --- News/Jobs insights ---

export async function getNewsDailyTrend(days = 30): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from("news_items")
    .select("pub_date")
    .eq("category", "news")
    .gte("pub_date", since)
    .order("pub_date", { ascending: true })
    .limit(5000);

  const counts = new Map<string, number>();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    counts.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of data ?? []) {
    const k = (row.pub_date as string).slice(0, 10);
    if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export async function getNewsSourceActivity(): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news_items")
    .select("source")
    .eq("category", "news")
    .limit(5000);
  return countByField(data ?? [], "source", 10);
}

export async function getJobsByCompany(limit = 10): Promise<ChartPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news_items")
    .select("source")
    .eq("category", "job")
    .limit(5000);
  return countByField(data ?? [], "source", limit);
}
