import type { Vendor } from "./types";

export type VendorStats = {
  total: number;
  engagingCount: number;
  partneredCount: number;
  startupCount: number;
};

export function computeVendorStats(vendors: Vendor[]): VendorStats {
  return {
    total: vendors.length,
    engagingCount: vendors.filter((v) => v.stage === "engaging").length,
    partneredCount: vendors.filter((v) => v.stage === "partnered").length,
    startupCount: vendors.filter((v) => v.type === "startup").length,
  };
}
