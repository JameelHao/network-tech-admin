import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const adminDir = path.resolve(__dirname, "../../../app/admin");

const tablePages = [
  { file: "conferences/page.tsx", hasHelper: true },
  { file: "leads/page.tsx", hasHelper: true },
  { file: "news/page.tsx", hasHelper: true },
  { file: "jobs/page.tsx", hasHelper: true },
  { file: "opensource/page.tsx", hasHelper: false },
  { file: "talents/page.tsx", hasHelper: false },
];

describe("table mobile overflow fixes", () => {
  it.each(tablePages.map((p) => p.file))("%s wraps table in overflow-x-auto", (file) => {
    const content = fs.readFileSync(path.join(adminDir, file), "utf-8");
    expect(content).toContain("overflow-x-auto");
  });

  it.each(tablePages.filter((p) => p.hasHelper).map((p) => p.file))(
    "%s Th/Td helpers use responsive padding (px-3 sm:px-4)",
    (file) => {
      const content = fs.readFileSync(path.join(adminDir, file), "utf-8");
      expect(content).toContain("px-3 sm:px-4");
    },
  );

  it.each(tablePages.filter((p) => !p.hasHelper).map((p) => p.file))(
    "%s uses responsive padding (px-3 sm:px-5)",
    (file) => {
      const content = fs.readFileSync(path.join(adminDir, file), "utf-8");
      expect(content).toContain("px-3 sm:px-5");
    },
  );

  it.each(tablePages.map((p) => p.file))("%s has whitespace-nowrap on date/number columns", (file) => {
    const content = fs.readFileSync(path.join(adminDir, file), "utf-8");
    expect(content).toContain("whitespace-nowrap");
  });

  it("opensource Name column has responsive max-w", () => {
    const content = fs.readFileSync(path.join(adminDir, "opensource/page.tsx"), "utf-8");
    expect(content).toContain("max-w-[150px] sm:max-w-xs");
  });

  it("PapersClient uses responsive row padding", () => {
    const content = fs.readFileSync(path.join(adminDir, "papers/PapersClient.tsx"), "utf-8");
    expect(content).toContain("px-3 sm:px-5");
  });
});
