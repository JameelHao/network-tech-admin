"use client";

import { useEffect, useState } from "react";
import { useFavoritesAll, useFavorites, type EntityType } from "@/hooks/useFavorites";
import { fetchFavoriteItems, type FavoriteItem } from "./actions";
import type { Dict, Lang } from "@/lib/i18n/dict";

const ENTITY_LABELS: Record<EntityType, string> = {
  conferences: "Conferences",
  papers: "Papers",
  opensource: "Open Source",
  news: "News",
  vendors: "Vendors",
};

const TYPE_COLORS: Record<EntityType, string> = {
  conferences: "bg-blue-100 text-blue-700 border-blue-200",
  papers: "bg-violet-100 text-violet-700 border-violet-200",
  opensource: "bg-cyan-100 text-cyan-700 border-cyan-200",
  news: "bg-orange-100 text-orange-700 border-orange-200",
  vendors: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export function FavoritesClient({ t, lang: _lang }: { t: Dict; lang: Lang }) {
  const { all: allFavorites, totalCount } = useFavoritesAll();
  const [items, setItems] = useState<(FavoriteItem & { ts: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (allFavorites.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    // Group by entity
    const byEntity = new Map<EntityType, string[]>();
    for (const { entity, id } of allFavorites) {
      if (!byEntity.has(entity)) byEntity.set(entity, []);
      byEntity.get(entity)!.push(id);
    }

    const tsMap = new Map<string, number>();
    for (const { entity, id, ts } of allFavorites) {
      tsMap.set(`${entity}:${id}`, ts);
    }

    setLoading(true);
    Promise.all(
      Array.from(byEntity.entries()).map(([entity, ids]) =>
        fetchFavoriteItems(entity, ids),
      ),
    ).then((results) => {
      const flat = results.flat();
      flat.sort((a, b) => {
        const ta = tsMap.get(`${a.entity}:${a.id}`) ?? 0;
        const tb = tsMap.get(`${b.entity}:${b.id}`) ?? 0;
        return tb - ta;
      });
      setItems(flat.map((item) => ({ ...item, ts: tsMap.get(`${item.entity}:${item.id}`) ?? 0 })));
      setLoading(false);
    });
  }, [allFavorites]);

  if (loading) {
    return <div className="rounded-lg border border-line bg-surface p-10 text-center text-[13px] text-ink-400">{t.sync.refreshing}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface p-10 text-center">
        <p className="text-[13px] text-ink-500">{t.favorite.noFavorites}</p>
        <p className="text-[12px] text-ink-400 mt-1">{t.favorite.noFavoritesDesc}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-line bg-paper/30 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          {totalCount} {t.favorite.favorites}
        </span>
      </div>
      <div className="divide-y divide-line">
        {items.map((item) => (
          <FavRow key={`${item.entity}:${item.id}`} item={item} />
        ))}
      </div>
    </div>
  );
}

function FavRow({ item }: { item: FavoriteItem & { ts: number } }) {
  const { toggle } = useFavorites(item.entity);
  const inner = (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-paper/40 transition-colors min-h-[48px] group">
      <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${TYPE_COLORS[item.entity]}`}>
        {ENTITY_LABELS[item.entity]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-ink-800 truncate">{item.title}</p>
        {item.subtitle && <p className="text-[11px] text-ink-400 truncate">{item.subtitle}</p>}
      </div>
      <time className="shrink-0 font-mono text-[10px] text-ink-400 tabular-nums">
        {new Date(item.ts).toLocaleDateString()}
      </time>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(item.id);
        }}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-red-500 hover:text-red-700 font-mono uppercase tracking-[0.12em]"
      >
        Remove
      </button>
    </div>
  );

  return inner;
}
