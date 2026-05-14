import type { Lead } from "./types";

export type LeadStats = {
  total: number;
  newCount: number;
  trackingCount: number;
  evaluatingCount: number;
};

export function computeLeadStats(leads: Lead[]): LeadStats {
  return {
    total: leads.length,
    newCount: leads.filter((l) => l.stage === "new").length,
    trackingCount: leads.filter((l) => l.stage === "tracking").length,
    evaluatingCount: leads.filter((l) => l.stage === "evaluating").length,
  };
}
