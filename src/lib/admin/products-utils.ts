import type { Product } from "./types";

export type ProductStats = {
  total: number;
  usingCount: number;
  evaluatingCount: number;
  openSourceCount: number;
};

export function computeProductStats(products: Product[]): ProductStats {
  return {
    total: products.length,
    usingCount: products.filter((p) => p.stage === "using").length,
    evaluatingCount: products.filter((p) => p.stage === "evaluating").length,
    openSourceCount: products.filter((p) => p.pricing === "open-source").length,
  };
}
