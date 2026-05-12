"use client";

import { useState } from "react";
import { useFavorites, type EntityType } from "@/hooks/useFavorites";

export function FavoriteFilter({
  entity,
  labels,
  onToggle,
}: {
  entity: EntityType;
  labels: { favorites: string; all: string };
  onToggle?: (active: boolean) => void;
}) {
  const { count } = useFavorites(entity);
  const [active, setActive] = useState(false);

  function toggle(v: boolean) {
    setActive(v);
    onToggle?.(v);
  }

  return (
    <>
      <div className="flex items-center rounded-full border border-line overflow-hidden">
        <button
          type="button"
          onClick={() => toggle(true)}
          className={`px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors whitespace-nowrap ${
            active ? "bg-navy-700 text-navy-50" : "text-ink-500 hover:text-ink-800"
          }`}
        >
          ★ {labels.favorites}
          {count > 0 ? ` (${count})` : ""}
        </button>
        <button
          type="button"
          onClick={() => toggle(false)}
          className={`px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
            !active ? "bg-navy-700 text-navy-50" : "text-ink-500 hover:text-ink-800"
          }`}
        >
          {labels.all}
        </button>
      </div>
      {active && (
        <style>{`[data-fav-filter="${entity}"] tr[data-fav="false"] { display: none; }`}</style>
      )}
    </>
  );
}
