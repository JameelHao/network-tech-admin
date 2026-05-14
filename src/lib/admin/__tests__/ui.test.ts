import { describe, it, expect } from "vitest";
import { tabClass, tabGroupClass, pageClass, badgeClass, calendarTodayClass } from "../ui";

describe("ui utility functions", () => {
  describe("tabClass", () => {
    it("returns active styles with pill shape and blue glow", () => {
      const cls = tabClass(true);
      expect(cls).toContain("rounded-full");
      expect(cls).toContain("text-[#0059b2]");
      expect(cls).toContain("bg-gradient-to-b");
      expect(cls).toContain("shadow-[inset_0_0_0_1px_rgba(0,113,227,0.16)");
    });

    it("returns inactive styles with hover lift", () => {
      const cls = tabClass(false);
      expect(cls).toContain("rounded-full");
      expect(cls).toContain("text-[#4f545a]");
      expect(cls).toContain("hover:-translate-y-px");
      expect(cls).toContain("hover:bg-white/[0.72]");
    });

    it("uses smaller sizing for sm variant", () => {
      const sm = tabClass(true, "sm");
      const md = tabClass(true, "md");
      expect(sm).toContain("text-[12px]");
      expect(sm).toContain("min-h-[36px]");
      expect(md).toContain("text-[13px]");
      expect(md).toContain("min-h-[40px]");
    });

    it("includes dark mode variants", () => {
      const cls = tabClass(true);
      expect(cls).toContain("dark:");
    });

    it("includes 160ms transition", () => {
      const cls = tabClass(true);
      expect(cls).toContain("duration-[160ms]");
    });

    it("active has font-semibold and tracking", () => {
      const cls = tabClass(true);
      expect(cls).toContain("font-semibold");
      expect(cls).toContain("tracking-[-0.01em]");
    });

    it("inactive has cursor-pointer", () => {
      const cls = tabClass(false);
      expect(cls).toContain("cursor-pointer");
    });

    it("active shadow is inset-only (no outer glow)", () => {
      const cls = tabClass(true);
      expect(cls).toContain("shadow-[inset_0_0_0_1px_rgba(0,113,227,0.16)]");
      expect(cls).not.toContain("0_8px_18px");
    });
  });

  describe("tabGroupClass", () => {
    it("returns segment control container with rounded-full", () => {
      const cls = tabGroupClass();
      expect(cls).toContain("inline-flex");
      expect(cls).toContain("rounded-full");
      expect(cls).toContain("border");
      expect(cls).toContain("bg-surface");
      expect(cls).toContain("shadow-[inset_0_1px_0");
    });

    it("uses subtle outer shadow (not heavy 8px)", () => {
      const cls = tabGroupClass();
      expect(cls).toContain("0_2px_6px_rgba(17,24,39,0.04)");
      expect(cls).not.toContain("0_8px_18px");
    });

    it("appends extra classes when provided", () => {
      const cls = tabGroupClass("ml-auto");
      expect(cls).toContain("ml-auto");
    });
  });

  describe("pageClass", () => {
    it("returns active page styles", () => {
      const cls = pageClass(true);
      expect(cls).toContain("rounded-full");
      expect(cls).toContain("bg-[rgba(238,247,255,0.98)]");
      expect(cls).toContain("border");
    });

    it("returns inactive page styles with hover", () => {
      const cls = pageClass(false);
      expect(cls).toContain("rounded-full");
      expect(cls).toContain("border-transparent");
      expect(cls).toContain("hover:");
    });
  });

  describe("badgeClass", () => {
    it("returns compact pill with monospace font", () => {
      const cls = badgeClass();
      expect(cls).toContain("rounded-full");
      expect(cls).toContain("font-mono");
      expect(cls).toContain("text-[9px]");
      expect(cls).toContain("px-1.5");
    });
  });

  describe("calendarTodayClass", () => {
    it("returns indigo gradient for today highlight", () => {
      const cls = calendarTodayClass();
      expect(cls).toContain("bg-gradient-to-br");
      expect(cls).toContain("from-[#6366f1]");
      expect(cls).toContain("to-[#818cf8]");
      expect(cls).toContain("text-white");
      expect(cls).toContain("font-semibold");
      expect(cls).toContain("shadow-");
    });
  });
});
