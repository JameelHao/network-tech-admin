import type { ConferenceTier } from "@/lib/admin/types";
import type { Lang } from "@/lib/i18n/dict";
import { CONFERENCE_TIERS } from "@/lib/admin/topics";

const TIER_STYLE: Record<ConferenceTier, string> = {
  top:      "border-gold-200 bg-gold-50 text-gold-700",
  good:     "border-navy-200 bg-navy-50 text-navy-700",
  workshop: "border-ink-200 bg-ink-50 text-ink-600",
};

export function TierBadge({ tier, lang }: { tier: ConferenceTier; lang: Lang }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9.5px] tracking-[0.1em] ${TIER_STYLE[tier]}`}>
      {CONFERENCE_TIERS[tier][lang]}
    </span>
  );
}
