"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { Lang } from "@/lib/i18n/dict";

type EventType = "paper" | "news" | "repo";
export type TimelineEvent = {
  type: EventType;
  id: string;
  date: string;
  title: string;
  href: string;
  meta: Record<string, any>;
};

const EVENT_ICON: Record<EventType, string> = {
  paper: "📄", news: "📰", repo: "⭐",
};

function groupByMonth(events: TimelineEvent[]): Record<string, TimelineEvent[]> {
  const groups: Record<string, TimelineEvent[]> = {};
  for (const ev of events) {
    const m = ev.date.slice(0, 7);
    if (!groups[m]) groups[m] = [];
    groups[m].push(ev);
  }
  return groups;
}

function EventMeta({ ev, lang }: { ev: TimelineEvent; lang: Lang }) {
  switch (ev.type) {
    case "paper":
      return (
        <span className="text-[12px] text-ink-500">
          {ev.meta.venue && <span className="text-navy-500">{ev.meta.venue}</span>}
          {ev.meta.citation_count != null && <> · {ev.meta.citation_count} {lang === "zh" ? "引用" : "cites"}</>}
        </span>
      );
    case "news":
      return (
        <span className="text-[12px] text-ink-500">
          {ev.meta.source && <span className="text-navy-500">{ev.meta.source}</span>}
        </span>
      );
    case "repo":
      return (
        <span className="text-[12px] text-ink-500">
          {ev.meta.stars != null && <>★ {ev.meta.stars}</>}
          {ev.meta.language && <> · {ev.meta.language}</>}
        </span>
      );
  }
}

type Props = {
  initialEvents: TimelineEvent[];
  total: number;
  slug: string;
  lang: Lang;
};

export function CompanyTimeline({ initialEvents, total, slug, lang }: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const hasMore = events.length < total;

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${slug}/timeline?page=${page + 1}&pageSize=10`);
      const data = await res.json();
      setEvents((prev) => [...prev, ...data.events]);
      setPage((p) => p + 1);
    } finally {
      setLoading(false);
    }
  }, [slug, page]);

  const months = groupByMonth(events);
  const monthKeys = Object.keys(months).sort((a, b) => b.localeCompare(a));

  if (events.length === 0) {
    return (
      <p className="text-[13px] text-ink-400 py-8 text-center">
        {lang === "zh" ? "暂无活动" : "No activity yet"}
      </p>
    );
  }

  return (
    <div>
      {/* Icon legend */}
      <div className="flex items-center gap-4 px-5 py-2 border-b border-line bg-paper/20 text-[11px] text-ink-500">
        <span>📄 Paper</span>
        <span>📰 News</span>
        <span>⭐ Repo</span>
      </div>
      <div className="divide-y divide-line">
        {monthKeys.map((month) => (
          <div key={month}>
            <div className="sticky top-0 bg-paper/90 backdrop-blur-sm z-10 px-5 py-2 border-b border-line">
              <span className="font-mono text-[11px] font-semibold text-ink-600">{month}</span>
            </div>
            <div className="divide-y divide-line">
              {months[month].map((ev, i) => (
                <EventRow key={`${ev.type}-${ev.id}-${i}`} ev={ev} lang={lang} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="px-5 py-4 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="text-[12px] font-mono text-navy-500 hover:text-navy-700 transition-colors disabled:text-ink-300 disabled:cursor-not-allowed"
          >
            {loading
              ? (lang === "zh" ? "加载中..." : "Loading...")
              : (lang === "zh" ? "加载更多" : "Load More")}
          </button>
        </div>
      )}
    </div>
  );
}

function EventRow({ ev, lang }: { ev: TimelineEvent; lang: Lang }) {
  const isExternal = ev.type === "news" || ev.type === "repo";
  const dateStr = ev.date.slice(5); // MM-DD

  const content = (
    <div className="flex items-start gap-3 px-5 py-3 hover:bg-paper/40 transition-colors min-h-[48px]">
      <span className="text-[16px] shrink-0 mt-0.5">{EVENT_ICON[ev.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-ink-800 truncate group-hover:text-navy-600 transition-colors">{ev.title}</p>
        <div className="mt-0.5"><EventMeta ev={ev} lang={lang} /></div>
      </div>
      <span className="font-mono text-[11px] text-ink-400 shrink-0 mt-0.5">{dateStr}</span>
    </div>
  );

  if (isExternal) {
    return (
      <a key={`${ev.type}-${ev.id}`} href={ev.href} target="_blank" rel="noopener noreferrer" className="block group">
        {content}
      </a>
    );
  }

  return (
    <Link key={`${ev.type}-${ev.id}`} href={ev.href} className="block group">
      {content}
    </Link>
  );
}
