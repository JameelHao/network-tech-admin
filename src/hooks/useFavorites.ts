"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export type EntityType = "conferences" | "papers" | "leads" | "talents" | "opensource" | "news" | "jobs";

type FavoriteEntry = { id: string; ts: number; label: string };
type FavoritesData = Record<EntityType, FavoriteEntry[]>;

const STORAGE_KEY = "nta-favorites";

function empty(): FavoritesData {
  return { conferences: [], papers: [], leads: [], talents: [], opensource: [], news: [], jobs: [] };
}

function readAll(): FavoritesData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

function writeAll(data: FavoritesData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("nta-favorites-changed"));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  const onCustom = () => cb();
  window.addEventListener("storage", onStorage);
  window.addEventListener("nta-favorites-changed", onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("nta-favorites-changed", onCustom);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

function getServerSnapshot() {
  return "";
}

export function useFavorites(entity: EntityType) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const entries: FavoriteEntry[] = useMemo(() => {
    try {
      const data = raw ? JSON.parse(raw) : {};
      return Array.isArray(data[entity]) ? data[entity] : [];
    } catch {
      return [];
    }
  }, [raw, entity]);

  const favIds = useMemo(() => new Set(entries.map((e) => e.id)), [entries]);

  const toggle = useCallback(
    (id: string, label?: string) => {
      const d = readAll();
      const list = d[entity];
      const idx = list.findIndex((e) => e.id === id);
      if (idx >= 0) {
        list.splice(idx, 1);
      } else {
        list.push({ id, ts: Date.now(), label: label ?? id });
      }
      writeAll(d);
    },
    [entity],
  );

  const isFav = useCallback((id: string) => favIds.has(id), [favIds]);

  return { toggle, isFav, favIds, count: favIds.size };
}

export function useFavoritesAll() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(() => {
    let data: FavoritesData;
    try {
      data = raw ? { ...empty(), ...JSON.parse(raw) } : empty();
    } catch {
      data = empty();
    }

    const all: { entity: EntityType; id: string; ts: number; label: string }[] = [];
    for (const [entity, entries] of Object.entries(data) as [EntityType, FavoriteEntry[]][]) {
      for (const e of entries) {
        all.push({ entity, id: e.id, ts: e.ts, label: e.label });
      }
    }
    const recent = all.sort((a, b) => b.ts - a.ts).slice(0, 5);
    const totalCount = all.length;
    return { recent, totalCount };
  }, [raw]);
}
