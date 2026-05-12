import { describe, it, expect } from "vitest";
import { tabClass, pageClass, badgeClass, calendarTodayClass } from "../ui";

describe("ui utility functions", () => {
  describe("tabClass", () => {
    it("returns active styles with pill shape", () => {
      const cls = tabClass(true);
      expect(cls).toContain("rounded-full");
      expect(cls).toContain("bg-[rgba(238,247,255,0.98)]");
      expect(cls).toContain("border");
      expect(cls).toContain("shadow-");
    });

    it("returns inactive styles with hover", () => {
      const cls = tabClass(false);
      expect(cls).toContain("rounded-full");
      expect(cls).toContain("hover:bg-");
      expect(cls).toContain("hover:shadow-");
    });

    it("uses smaller sizing for sm variant", () => {
      const sm = tabClass(true, "sm");
      const md = tabClass(true, "md");
      expect(sm).toContain("text-[11px]");
      expect(md).toContain("text-[12px]");
    });

    it("includes dark mode variants", () => {
      const cls = tabClass(true);
      expect(cls).toContain("dark:");
    });

    it("includes 140ms transition", () => {
      const cls = tabClass(true);
      expect(cls).toContain("duration-[140ms]");
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
