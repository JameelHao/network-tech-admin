import { describe, it, expect } from "vitest";
import { computeProductStats } from "../products-utils";
import type { Product } from "../types";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "1",
    name: "Test Product",
    vendor: null,
    category: "tool",
    description: null,
    url: null,
    changelog_url: null,
    latest_version: null,
    release_date: null,
    pricing: "free",
    topics: [],
    stage: "watching",
    notes: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...overrides,
  };
}

describe("computeProductStats", () => {
  it("returns zeros for empty array", () => {
    const stats = computeProductStats([]);
    expect(stats.total).toBe(0);
    expect(stats.usingCount).toBe(0);
    expect(stats.evaluatingCount).toBe(0);
    expect(stats.openSourceCount).toBe(0);
  });

  it("counts total items", () => {
    const products = [
      makeProduct({ id: "1" }),
      makeProduct({ id: "2" }),
      makeProduct({ id: "3" }),
    ];
    expect(computeProductStats(products).total).toBe(3);
  });

  it("counts using stage products", () => {
    const products = [
      makeProduct({ id: "1", stage: "using" }),
      makeProduct({ id: "2", stage: "using" }),
      makeProduct({ id: "3", stage: "watching" }),
    ];
    expect(computeProductStats(products).usingCount).toBe(2);
  });

  it("counts evaluating stage products", () => {
    const products = [
      makeProduct({ id: "1", stage: "evaluating" }),
      makeProduct({ id: "2", stage: "evaluating" }),
      makeProduct({ id: "3", stage: "using" }),
    ];
    expect(computeProductStats(products).evaluatingCount).toBe(2);
  });

  it("counts open-source pricing products", () => {
    const products = [
      makeProduct({ id: "1", pricing: "open-source" }),
      makeProduct({ id: "2", pricing: "open-source" }),
      makeProduct({ id: "3", pricing: "paid" }),
    ];
    expect(computeProductStats(products).openSourceCount).toBe(2);
  });

  it("does not count watching/archived in using or evaluating", () => {
    const products = [
      makeProduct({ id: "1", stage: "watching" }),
      makeProduct({ id: "2", stage: "archived" }),
    ];
    const stats = computeProductStats(products);
    expect(stats.total).toBe(2);
    expect(stats.usingCount).toBe(0);
    expect(stats.evaluatingCount).toBe(0);
  });

  it("does not count non-open-source in openSourceCount", () => {
    const products = [
      makeProduct({ id: "1", pricing: "free" }),
      makeProduct({ id: "2", pricing: "freemium" }),
      makeProduct({ id: "3", pricing: "paid" }),
      makeProduct({ id: "4", pricing: "enterprise" }),
    ];
    expect(computeProductStats(products).openSourceCount).toBe(0);
  });

  it("handles mixed stages and pricing", () => {
    const products = [
      makeProduct({ id: "1", stage: "using", pricing: "open-source" }),
      makeProduct({ id: "2", stage: "evaluating", pricing: "paid" }),
      makeProduct({ id: "3", stage: "watching", pricing: "open-source" }),
      makeProduct({ id: "4", stage: "archived", pricing: "free" }),
      makeProduct({ id: "5", stage: "using", pricing: "enterprise" }),
    ];
    const stats = computeProductStats(products);
    expect(stats.total).toBe(5);
    expect(stats.usingCount).toBe(2);
    expect(stats.evaluatingCount).toBe(1);
    expect(stats.openSourceCount).toBe(2);
  });
});
