import { createClient } from "@/lib/supabase/server";
import type { Conference, Paper, Lead, TalentLead, OpenSource } from "./types";
import {
  mapConferences,
  mapPapers,
  mapLeads,
  mapTalents,
  mapOpenSource,
  mapNews,
  type SearchableItem,
  type NewsItemLight,
} from "./command-search";

export async function buildSearchIndex(): Promise<SearchableItem[]> {
  const supabase = await createClient();

  const [confRes, paperRes, leadRes, talentRes, osRes, newsRes] = await Promise.all([
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
    supabase
      .from("news_items")
      .select("id, title, link, source")
      .eq("category", "news")
      .order("pub_date", { ascending: false })
      .limit(200),
  ]);

  return [
    ...mapConferences((confRes.data as Conference[]) ?? []),
    ...mapPapers((paperRes.data as Paper[]) ?? []),
    ...mapLeads((leadRes.data as Lead[]) ?? []),
    ...mapTalents((talentRes.data as TalentLead[]) ?? []),
    ...mapOpenSource((osRes.data as OpenSource[]) ?? []),
    ...mapNews((newsRes.data as NewsItemLight[]) ?? []),
  ];
}
