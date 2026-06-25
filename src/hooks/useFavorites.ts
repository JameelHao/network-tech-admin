"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type EntityType = "conferences" | "papers" | "opensource" | "news" | "vendors";

type FavoriteEntry = { id: string; ts: number; label: string };
type FavoritesData = Record<EntityType, FavoriteEntry[]>;

function empty(): FavoritesData {
  return { conferences: [], papers: [], opensource: [], news: [], vendors: [] };
}

const FAV_CHANGED = "nta-fav-changed";

async function fetchAll(): Promise<FavoritesData> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("user_favorites")
    .select("entity_type, entity_id, label, created_at")
    .order("created_at", { ascending: false });

  const result = empty();
  for (const r of rows ?? []) {
    const et = r.entity_type as EntityType;
    if (result[et]) {
      result[et].push({ id: r.entity_id, ts: new Date(r.created_at).getTime(), label: r.label });
    }
  }
  return result;
}

async function fetchForEntity(entity: EntityType): Promise<FavoriteEntry[]> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("user_favorites")
    .select("entity_id, label, created_at")
    .eq("entity_type", entity)
    .order("created_at", { ascending: false });

  return (rows ?? []).map((r) => ({
    id: r.entity_id,
    ts: new Date(r.created_at).getTime(),
    label: r.label,
  }));
}

export function useFavorites(entity: EntityType) {
  const [entries, setEntries] = useState<FavoriteEntry[]>([]);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const refresh = useCallback(() => {
    fetchForEntity(entity).then(setEntries);
  }, [entity]);

  useEffect(() => {
    refresh();
    window.addEventListener(FAV_CHANGED, refresh);
    return () => window.removeEventListener(FAV_CHANGED, refresh);
  }, [refresh]);

  const favIds = useMemo(() => new Set(entries.map((e) => e.id)), [entries]);

  const toggle = useCallback(
    async (id: string, label?: string) => {
      const supabase = createClient();
      const isFav = entriesRef.current.some((e) => e.id === id);
      const { error } = isFav
        ? await supabase.from("user_favorites").delete().eq("entity_type", entity).eq("entity_id", id)
        : await supabase.from("user_favorites").insert({ entity_type: entity, entity_id: id, label: label ?? id });
      if (error) return;
      window.dispatchEvent(new Event(FAV_CHANGED));
    },
    [entity],
  );

  const isFav = useCallback((id: string) => favIds.has(id), [favIds]);

  return { toggle, isFav, favIds, count: favIds.size };
}

export function useFavoritesAll() {
  const [data, setData] = useState<FavoritesData>(empty());

  const refresh = useCallback(() => {
    fetchAll().then(setData);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(FAV_CHANGED, refresh);
    return () => window.removeEventListener(FAV_CHANGED, refresh);
  }, [refresh]);

  const all = useMemo(() => {
    const result: { entity: EntityType; id: string; ts: number; label: string }[] = [];
    for (const [entity, entries] of Object.entries(data) as [EntityType, FavoriteEntry[]][]) {
      for (const e of entries) {
        result.push({ entity, id: e.id, ts: e.ts, label: e.label });
      }
    }
    result.sort((a, b) => b.ts - a.ts);
    return result;
  }, [data]);

  const totalCount = all.length;
  const recent = all.slice(0, 5);

  return { all, recent, totalCount };
}
