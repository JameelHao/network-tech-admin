import { describe, it, expect } from "vitest";
import { computeVendorStats } from "../vendors-utils";
import type { Vendor } from "../types";

function makeVendor(overrides: Partial<Vendor> = {}): Vendor {
  return {
    id: "1",
    name: "Test Vendor",
    type: "vendor",
    website: null,
    description: null,
    hq_location: null,
    founded_year: null,
    employee_range: null,
    key_products: [],
    topics: [],
    stage: "watching",
    notes: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...overrides,
  };
}

describe("computeVendorStats", () => {
  it("returns zeros for empty array", () => {
    const stats = computeVendorStats([]);
    expect(stats.total).toBe(0);
    expect(stats.engagingCount).toBe(0);
    expect(stats.partneredCount).toBe(0);
    expect(stats.startupCount).toBe(0);
  });

  it("counts total items", () => {
    const vendors = [
      makeVendor({ id: "1" }),
      makeVendor({ id: "2" }),
      makeVendor({ id: "3" }),
    ];
    expect(computeVendorStats(vendors).total).toBe(3);
  });

  it("counts engaging stage vendors", () => {
    const vendors = [
      makeVendor({ id: "1", stage: "engaging" }),
      makeVendor({ id: "2", stage: "engaging" }),
      makeVendor({ id: "3", stage: "watching" }),
    ];
    expect(computeVendorStats(vendors).engagingCount).toBe(2);
  });

  it("counts partnered stage vendors", () => {
    const vendors = [
      makeVendor({ id: "1", stage: "partnered" }),
      makeVendor({ id: "2", stage: "partnered" }),
      makeVendor({ id: "3", stage: "engaging" }),
    ];
    expect(computeVendorStats(vendors).partneredCount).toBe(2);
  });

  it("counts startup type vendors", () => {
    const vendors = [
      makeVendor({ id: "1", type: "startup" }),
      makeVendor({ id: "2", type: "startup" }),
      makeVendor({ id: "3", type: "vendor" }),
    ];
    expect(computeVendorStats(vendors).startupCount).toBe(2);
  });

  it("does not count watching/archived in engaging or partnered", () => {
    const vendors = [
      makeVendor({ id: "1", stage: "watching" }),
      makeVendor({ id: "2", stage: "archived" }),
    ];
    const stats = computeVendorStats(vendors);
    expect(stats.total).toBe(2);
    expect(stats.engagingCount).toBe(0);
    expect(stats.partneredCount).toBe(0);
  });

  it("does not count non-startup types in startupCount", () => {
    const vendors = [
      makeVendor({ id: "1", type: "vendor" }),
      makeVendor({ id: "2", type: "partner" }),
      makeVendor({ id: "3", type: "competitor" }),
      makeVendor({ id: "4", type: "academic" }),
    ];
    expect(computeVendorStats(vendors).startupCount).toBe(0);
  });

  it("handles mixed stages and types", () => {
    const vendors = [
      makeVendor({ id: "1", stage: "engaging", type: "startup" }),
      makeVendor({ id: "2", stage: "partnered", type: "vendor" }),
      makeVendor({ id: "3", stage: "watching", type: "startup" }),
      makeVendor({ id: "4", stage: "archived", type: "competitor" }),
      makeVendor({ id: "5", stage: "engaging", type: "partner" }),
    ];
    const stats = computeVendorStats(vendors);
    expect(stats.total).toBe(5);
    expect(stats.engagingCount).toBe(2);
    expect(stats.partneredCount).toBe(1);
    expect(stats.startupCount).toBe(2);
  });
});
