import type { TalentLead } from "./types";

export type TalentStats = {
  total: number;
  newCount: number;
  trackingCount: number;
  companyCount: number;
};

export function computeTalentStats(talents: TalentLead[]): TalentStats {
  return {
    total: talents.length,
    newCount: talents.filter((t) => t.stage === "new").length,
    trackingCount: talents.filter((t) => t.stage === "tracking").length,
    companyCount: new Set(talents.map((t) => t.company).filter(Boolean)).size,
  };
}
