"use client";

import Link from "next/link";
import { useFavoritesAll, type EntityType } from "@/hooks/useFavorites";
import { EmptyState } from "@/components/admin/EmptyState";

const ENTITY_PATHS: Record<EntityType, string> = {
  conferences: "/admin/conferences",
  papers: "/admin/papers",
  leads: "/admin/leads",
  talents: "/admin/talents",
  opensource: "/admin/opensource",
  news: "/admin/news",
  jobs: "/admin/jobs",
};

const ENTITY_COLORS: Record<EntityType, string> = {
  conferences: "bg-navy-100 text-navy-600",
  papers: "bg-cobalt-100 text-cobalt-600",
  leads: "bg-amber-100 text-amber-700",
  talents: "bg-moss-100 text-moss-700",
  opensource: "bg-ink-100 text-ink-600",
  news: "bg-rust-100 text-rust-600",
  jobs: "bg-violet-100 text-violet-600",
};

export function Watchlist({
  labels,
}: {
  labels: {
    watchlist: string;
    noFavorites: string;
    noFavoritesDesc: string;
    entityLabels: Record<EntityType, string>;
  };
}) {
  const { recent, totalCount } = useFavoritesAll();

  if (totalCount === 0) return null;

  return (
    <section className="rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
        <h2 className="font-sans text-[15px] font-semibold tracking-tight text-ink-800">
          {labels.watchlist}
          <span className="ml-2 font-mono text-[11px] text-ink-400">{totalCount}</span>
        </h2>
      </div>
      <div className="divide-y divide-line">
        {recent.length === 0 ? (
          <EmptyState title={labels.noFavorites} description={labels.noFavoritesDesc} compact />
        ) : (
          recent.map((fav) => (
            <Link
              key={`${fav.entity}-${fav.id}`}
              href={`${ENTITY_PATHS[fav.entity]}/${fav.id}`}
              className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-paper/40 transition-colors min-h-[44px]"
            >
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] shrink-0 ${ENTITY_COLORS[fav.entity]}`}
              >
                {labels.entityLabels[fav.entity]}
              </span>
              <span className="text-[13px] font-medium text-ink-800 truncate flex-1">{fav.label}</span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
