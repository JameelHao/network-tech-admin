"use client";

import { useRef, useEffect } from "react";
import { useFavorites, type EntityType } from "@/hooks/useFavorites";

export function FavoriteButton({ entity, id, label }: { entity: EntityType; id: string; label?: string }) {
  const { isFav, toggle } = useFavorites(entity);
  const fav = isFav(id);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tr = ref.current?.closest("tr");
    if (tr) tr.setAttribute("data-fav", String(fav));
  }, [fav]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id, label);
      }}
      className={`transition-colors ${fav ? "text-amber-500" : "text-ink-300 hover:text-amber-400"}`}
      aria-label={fav ? "Unfavorite" : "Favorite"}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2">
        <path d="M8 1.5l2 4 4.5.7-3.2 3.1.8 4.4L8 11.5l-4.1 2.2.8-4.4L1.5 6.2l4.5-.7z" />
      </svg>
    </button>
  );
}
