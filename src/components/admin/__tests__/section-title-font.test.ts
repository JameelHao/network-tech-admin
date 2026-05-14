import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const adminDir = path.resolve(__dirname, "../../../app/admin");

function read(file: string) {
  return fs.readFileSync(path.join(adminDir, file), "utf-8");
}

describe("section titles use font-sans instead of font-display", () => {
  const dashboardFile = "page.tsx";
  const listPages = [
    "talents/page.tsx",
    "news/NewsContent.tsx",
    "jobs/JobsContent.tsx",
  ];
  const detailPages = [
    "insights/page.tsx",
    "topics/TopicsClient.tsx",
    "papers/[id]/page.tsx",
    "leads/[id]/page.tsx",
    "opensource/[id]/page.tsx",
    "conferences/[id]/page.tsx",
  ];

  describe("Type 1: Dashboard section titles", () => {
    it("uses font-sans text-[13px] font-semibold", () => {
      const content = read(dashboardFile);
      expect(content).toContain("font-sans text-[13px] font-semibold tracking-tight");
    });

    it("does not use font-display for section titles", () => {
      const content = read(dashboardFile);
      expect(content).not.toContain("font-display text-[15px]");
    });
  });

  describe("Type 2: List page card titles", () => {
    it.each(listPages)("%s uses font-sans text-[15px] font-semibold", (file) => {
      const content = read(file);
      expect(content).toContain("font-sans text-[15px] font-semibold tracking-tight");
    });

    it.each(listPages)("%s does not use font-display text-[17px]", (file) => {
      const content = read(file);
      expect(content).not.toContain("font-display text-[17px]");
    });
  });

  describe("Type 3: Page titles", () => {
    it.each(detailPages)("%s uses font-sans with font-bold and tight tracking", (file) => {
      const content = read(file);
      expect(content).toContain("font-sans");
      expect(content).toContain("font-bold");
      expect(content).toContain('tracking-[-0.02em]');
    });

    it.each(detailPages)("%s does not use font-display for page titles", (file) => {
      const content = read(file);
      expect(content).not.toMatch(/font-display text-\[20px\]/);
    });
  });
});
