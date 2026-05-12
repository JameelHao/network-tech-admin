import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const scriptsDir = path.resolve(__dirname, "..");
const seedFiles = fs
  .readdirSync(scriptsDir)
  .filter((f) => f.match(/^seed-.*-sessions\.ts$/))
  .sort();

describe("seed-*-sessions.ts query pattern", () => {
  it("finds all 17 seed session scripts", () => {
    expect(seedFiles.length).toBe(17);
  });

  it.each(seedFiles)("%s has YEAR constant", (file) => {
    const content = fs.readFileSync(path.join(scriptsDir, file), "utf-8");
    expect(content).toContain('const YEAR = "2026"');
  });

  it.each(seedFiles)("%s uses ilike year filter", (file) => {
    const content = fs.readFileSync(path.join(scriptsDir, file), "utf-8");
    expect(content).toContain('.ilike("name", `%${YEAR}%`)');
  });

  it.each(seedFiles)("%s uses .limit(1).single()", (file) => {
    const content = fs.readFileSync(path.join(scriptsDir, file), "utf-8");
    expect(content).toMatch(/\.limit\(1\)\s*\n\s*\.single\(\)/);
  });

  it.each(seedFiles)("%s does NOT use bare .eq().single() without year filter", (file) => {
    const content = fs.readFileSync(path.join(scriptsDir, file), "utf-8");
    const hasBareSingle = /\.eq\("abbreviation".*\)\s*\n\s*\.single\(\)/.test(content);
    expect(hasBareSingle).toBe(false);
  });
});
