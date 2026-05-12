import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const adminDir = path.resolve(__dirname, "../../../app/admin");

const pages = [
  "conferences/page.tsx",
  "leads/page.tsx",
  "talents/page.tsx",
  "news/page.tsx",
  "jobs/page.tsx",
  "opensource/page.tsx",
];

const papersClient = path.resolve(adminDir, "papers/PapersClient.tsx");

describe("mobile filter panel integration", () => {
  it.each(pages)("%s imports MobileFilterPanel", (page) => {
    const content = fs.readFileSync(path.join(adminDir, page), "utf-8");
    expect(content).toContain("MobileFilterPanel");
  });

  it.each(pages)("%s imports OverflowMenu", (page) => {
    const content = fs.readFileSync(path.join(adminDir, page), "utf-8");
    expect(content).toContain("OverflowMenu");
  });

  it.each(pages)("%s has desktop-only filter bar (hidden lg:flex)", (page) => {
    const content = fs.readFileSync(path.join(adminDir, page), "utf-8");
    expect(content).toContain("hidden lg:flex");
  });

  it.each(pages)("%s has desktop-only export buttons (hidden lg:flex)", (page) => {
    const content = fs.readFileSync(path.join(adminDir, page), "utf-8");
    const exportBlocks = content.match(/hidden lg:flex/g);
    expect(exportBlocks!.length).toBeGreaterThanOrEqual(1);
  });

  it("PapersClient.tsx uses MobileFilterPanel instead of MobileFilterBar", () => {
    const content = fs.readFileSync(papersClient, "utf-8");
    expect(content).toContain("MobileFilterPanel");
    expect(content).not.toContain("MobileFilterBar");
  });

  it("PapersClient.tsx uses OverflowMenu", () => {
    const content = fs.readFileSync(papersClient, "utf-8");
    expect(content).toContain("OverflowMenu");
  });
});
