"use server";

import { createClient } from "@/lib/supabase/server";
import type { EntityType } from "@/hooks/useFavorites";

export type FavoriteItem = {
  entity: EntityType;
  id: string;
  title: string;
  subtitle: string | null;
  url: string | null;
};

export async function fetchFavoriteItems(
  entity: EntityType,
  ids: string[],
): Promise<FavoriteItem[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();

  switch (entity) {
    case "papers": {
      const { data } = await supabase
        .from("papers")
        .select("id, title, venue")
        .in("id", ids);
      return (data ?? []).map((r) => ({
        entity,
        id: r.id,
        title: r.title,
        subtitle: r.venue,
        url: `/admin/papers/${r.id}`,
      }));
    }
    case "conferences": {
      const { data } = await supabase
        .from("conferences")
        .select("id, name, abbreviation")
        .in("id", ids);
      return (data ?? []).map((r) => ({
        entity,
        id: r.id,
        title: r.name,
        subtitle: r.abbreviation,
        url: `/admin/conferences/${r.id}`,
      }));
    }
    case "opensource": {
      const { data } = await supabase
        .from("opensource")
        .select("id, name, language")
        .in("id", ids);
      return (data ?? []).map((r) => ({
        entity,
        id: r.id,
        title: r.name,
        subtitle: r.language,
        url: `/admin/opensource/${r.id}`,
      }));
    }
    case "news": {
      const { data } = await supabase
        .from("news_items")
        .select("id, title, source")
        .eq("category", "news")
        .in("id", ids);
      return (data ?? []).map((r) => ({
        entity,
        id: r.id,
        title: r.title,
        subtitle: r.source,
        url: null,
      }));
    }
    case "vendors": {
      const { data } = await supabase
        .from("vendors")
        .select("id, name, type")
        .in("id", ids);
      return (data ?? []).map((r) => ({
        entity,
        id: r.id,
        title: r.name,
        subtitle: r.type,
        url: null,
      }));
    }
  }
}
