"use client";

import { useState } from "react";
import { useFavorites, type EntityType } from "@/hooks/useFavorites";
import { tabClass, tabGroupClass } from "@/lib/admin/ui";

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
      <div className={tabGroupClass()}>
        <button
          type="button"
          onClick={() => toggle(true)}
          className={tabClass(active, "sm")}
        >
          ★ {labels.favorites}
          {count > 0 ? ` (${count})` : ""}
        </button>
        <button
          type="button"
          onClick={() => toggle(false)}
          className={tabClass(!active, "sm")}
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
