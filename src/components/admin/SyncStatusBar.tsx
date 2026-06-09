import { createClient } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/admin/format";
import { getFreshness } from "@/lib/admin/freshness";
import type { Lang } from "@/lib/i18n/dict";

type SyncLabels = {
  lastSync: string;
  refresh: string;
  refreshing: string;
  noData: string;
  syncResult?: string;
  sourcesFailed?: string;
  syncProgress?: string;
};

export async function SyncStatusBar({
  entity,
  labels,
  lang,
}: {
  entity: string;
  labels: SyncLabels;
  lang: Lang;
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sync_meta")
    .select("last_sync_at, last_result")
    .eq("entity", entity)
    .maybeSingle();

  if (!data?.last_sync_at) {
    return (
      <div className="flex items-center gap-2 px-5 py-2 bg-ink-50 border-b border-line">
        <span className="w-1.5 h-1.5 rounded-full bg-ink-300" />
        <span className="text-[11px] font-mono text-ink-400">{labels.noData}</span>
      </div>
    );
  }

  const freshness = getFreshness(data.last_sync_at);

  return (
    <div className="flex items-center gap-2 px-5 py-2 bg-ink-50 border-b border-line">
      <span className={`w-1.5 h-1.5 rounded-full ${freshness.level === "fresh" ? "bg-emerald-500" : freshness.level === "stale" ? "bg-amber-500" : "bg-rose-500"}`} />
      <span className="text-[11px] font-mono text-ink-500">
        {labels.lastSync}: {relativeTime(data.last_sync_at, lang)}
      </span>
    </div>
  );
}
