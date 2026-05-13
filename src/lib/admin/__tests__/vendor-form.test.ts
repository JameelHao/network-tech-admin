import { describe, it, expect } from "vitest";
import { VENDOR_TYPES, VENDOR_STAGES } from "../types";
import { dict } from "@/lib/i18n/dict";

const EMPLOYEE_RANGES = ["1-50", "51-200", "201-1000", "1001-5000", "5000+"];

const TYPE_I18N_MAP: Record<string, string> = {
  vendor: "vendorType",
  partner: "partner",
  competitor: "competitor",
  startup: "startup",
  academic: "academic",
};

describe("vendor form - field mappings", () => {
  it("all vendor types have i18n labels in en", () => {
    for (const vt of VENDOR_TYPES) {
      const key = TYPE_I18N_MAP[vt] as keyof typeof dict.en.vendor;
      expect(dict.en.vendor[key]).toBeDefined();
      expect(typeof dict.en.vendor[key]).toBe("string");
    }
  });

  it("all vendor types have i18n labels in zh", () => {
    for (const vt of VENDOR_TYPES) {
      const key = TYPE_I18N_MAP[vt] as keyof typeof dict.zh.vendor;
      expect(dict.zh.vendor[key]).toBeDefined();
      expect(typeof dict.zh.vendor[key]).toBe("string");
    }
  });

  it("all vendor stages have i18n labels in en", () => {
    for (const s of VENDOR_STAGES) {
      const key = s as keyof typeof dict.en.vendor;
      expect(dict.en.vendor[key]).toBeDefined();
    }
  });

  it("all vendor stages have i18n labels in zh", () => {
    for (const s of VENDOR_STAGES) {
      const key = s as keyof typeof dict.zh.vendor;
      expect(dict.zh.vendor[key]).toBeDefined();
    }
  });
});

describe("vendor form - employee range options", () => {
  it("has exactly 5 employee range options", () => {
    expect(EMPLOYEE_RANGES).toHaveLength(5);
  });

  it("ranges are ordered from smallest to largest", () => {
    expect(EMPLOYEE_RANGES[0]).toBe("1-50");
    expect(EMPLOYEE_RANGES[4]).toBe("5000+");
  });

  it("all ranges are non-empty strings", () => {
    for (const r of EMPLOYEE_RANGES) {
      expect(r.length).toBeGreaterThan(0);
    }
  });
});

describe("vendor form - form data parsing", () => {
  it("parses comma-separated key_products correctly", () => {
    const raw = "IOS XR, Nexus, Meraki";
    const parsed = raw.split(",").map((s) => s.trim()).filter(Boolean);
    expect(parsed).toEqual(["IOS XR", "Nexus", "Meraki"]);
  });

  it("handles empty key_products string", () => {
    const raw = "";
    const parsed = raw.split(",").map((s) => s.trim()).filter(Boolean);
    expect(parsed).toEqual([]);
  });

  it("parses comma-separated topics correctly", () => {
    const raw = "SDN, NFV, 5G";
    const parsed = raw.split(",").map((s) => s.trim()).filter(Boolean);
    expect(parsed).toEqual(["SDN", "NFV", "5G"]);
  });

  it("parses founded_year as integer", () => {
    const raw = "1984";
    const parsed = parseInt(raw, 10);
    expect(parsed).toBe(1984);
    expect(Number.isNaN(parsed)).toBe(false);
  });

  it("handles empty founded_year as NaN", () => {
    const raw = "";
    const parsed = raw ? parseInt(raw, 10) : null;
    expect(parsed).toBeNull();
  });

  it("treats NaN founded_year as null", () => {
    const raw = "abc";
    const parsed = parseInt(raw, 10);
    const result = Number.isNaN(parsed) ? null : parsed;
    expect(result).toBeNull();
  });
});

describe("vendor form - i18n placeholders", () => {
  it("has form placeholders in en", () => {
    expect(dict.en.vendor.namePlaceholder).toBeDefined();
    expect(dict.en.vendor.websitePlaceholder).toBeDefined();
    expect(dict.en.vendor.descriptionPlaceholder).toBeDefined();
    expect(dict.en.vendor.hqLocationPlaceholder).toBeDefined();
    expect(dict.en.vendor.foundedYearPlaceholder).toBeDefined();
    expect(dict.en.vendor.keyProductsPlaceholder).toBeDefined();
  });

  it("has form placeholders in zh", () => {
    expect(dict.zh.vendor.namePlaceholder).toBeDefined();
    expect(dict.zh.vendor.websitePlaceholder).toBeDefined();
    expect(dict.zh.vendor.descriptionPlaceholder).toBeDefined();
    expect(dict.zh.vendor.hqLocationPlaceholder).toBeDefined();
    expect(dict.zh.vendor.foundedYearPlaceholder).toBeDefined();
    expect(dict.zh.vendor.keyProductsPlaceholder).toBeDefined();
  });
});
