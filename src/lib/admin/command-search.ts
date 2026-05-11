import { createClient } from "@/lib/supabase/server";
import type { Conference, Paper, Lead, TalentLead, OpenSource } from "./types";
import { listNewsLight, type NewsItemLight } from "./news-items";

export type EntityType = "conference" | "paper" | "lead" | "talent" | "news" | "opensource";

export type SearchableItem = {
  id: string;
  type: EntityType;
  title: string;
  subtitle: string;
  href: string;
  external?: boolean;
};

export function mapConferences(rows: Conference[]): SearchableItem[] {
  return rows.map((c) => ({
    id: c.id,
    type: "conference" as const,
    title: c.abbreviation ? `${c.abbreviation} — ${c.name}` : c.name,
    subtitle: [c.location, c.start_date].filter(Boolean).join(" · "),
    href: `/admin/conferences/${c.id}`,
  }));
}

export function mapPapers(rows: Paper[]): SearchableItem[] {
  return rows.map((p) => ({
    id: p.id,
    type: "paper" as const,
    title: p.title,
    subtitle: p.authors.slice(0, 3).join(", ") + (p.authors.length > 3 ? " …" : ""),
    href: `/admin/papers/${p.id}`,
  }));
}

export function mapLeads(rows: Lead[]): SearchableItem[] {
  return rows.map((l) => ({
    id: l.id,
    type: "lead" as const,
    title: l.title,
    subtitle: [l.source_label, l.stage].filter(Boolean).join(" · "),
    href: `/admin/leads/${l.id}`,
  }));
}

export function mapTalents(rows: TalentLead[]): SearchableItem[] {
  return rows.map((t) => ({
    id: t.id,
    type: "talent" as const,
    title: t.name,
    subtitle: [t.company, t.role].filter(Boolean).join(" · "),
    href: `/admin/talents/${t.id}`,
  }));
}

export function mapNews(rows: NewsItemLight[]): SearchableItem[] {
  return rows.map((n) => ({
    id: n.id,
    type: "news" as const,
    title: n.title,
    subtitle: n.source ?? "",
    href: n.link,
    external: true,
  }));
}

export function mapOpenSource(rows: OpenSource[]): SearchableItem[] {
  return rows.map((o) => ({
    id: o.id,
    type: "opensource" as const,
    title: o.name,
    subtitle: [
      o.description ? o.description.slice(0, 60) : null,
      o.stars != null ? `★${o.stars}` : null,
    ].filter(Boolean).join(" · "),
    href: `/admin/opensource/${o.id}`,
  }));
}

export function filterItems(items: SearchableItem[], query: string): SearchableItem[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q),
  );
}

export function groupByType(items: SearchableItem[]): Map<EntityType, SearchableItem[]> {
  const map = new Map<EntityType, SearchableItem[]>();
  for (const item of items) {
    if (!map.has(item.type)) map.set(item.type, []);
    map.get(item.type)!.push(item);
  }
  return map;
}

export async function buildSearchIndex(): Promise<SearchableItem[]> {
  const supabase = await createClient();

  const [confRes, paperRes, leadRes, talentRes, osRes, newsRows] = await Promise.all([
    supabase
      .from("conferences")
      .select("id, name, abbreviation, location, start_date")
      .order("start_date", { ascending: false })
      .limit(300),
    supabase
      .from("papers")
      .select("id, title, authors")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("leads")
      .select("id, title, source_label, stage")
      .order("updated_at", { ascending: false })
      .limit(300),
    supabase
      .from("talent_leads")
      .select("id, name, company, role")
      .order("updated_at", { ascending: false })
      .limit(300),
    supabase
      .from("opensource")
      .select("id, name, description, stars")
      .order("created_at", { ascending: false })
      .limit(300),
    listNewsLight(200),
  ]);

  return [
    ...mapConferences((confRes.data as Conference[]) ?? []),
    ...mapPapers((paperRes.data as Paper[]) ?? []),
    ...mapLeads((leadRes.data as Lead[]) ?? []),
    ...mapTalents((talentRes.data as TalentLead[]) ?? []),
    ...mapOpenSource((osRes.data as OpenSource[]) ?? []),
    ...mapNews(newsRows),
  ];
}
