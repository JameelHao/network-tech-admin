import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const srcDir = path.resolve(__dirname, "../../..");

function findFiles(dir: string, ext: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      results.push(...findFiles(full, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext) && !entry.name.includes(".test.")) {
      results.push(full);
    }
  }
  return results;
}

describe("font consistency across codebase", () => {
  const tsxFiles = findFiles(srcDir, ".tsx");
  const cssFiles = findFiles(srcDir, ".css");

  it("no tsx file uses font-display as a Tailwind class", () => {
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const rel = path.relative(srcDir, file);
      expect(content, `${rel} still uses font-display class`).not.toMatch(/\bfont-display\b/);
    }
  });

  it("no css file defines --font-display variable", () => {
    for (const file of cssFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const rel = path.relative(srcDir, file);
      expect(content, `${rel} still defines --font-display`).not.toContain("--font-display");
    }
  });

  it("no file references Playfair Display", () => {
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const rel = path.relative(srcDir, file);
      expect(content, `${rel} still references Playfair`).not.toContain("Playfair");
    }
  });

  it("no file hardcodes IBM Plex font family", () => {
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const rel = path.relative(srcDir, file);
      expect(content, `${rel} still hardcodes IBM Plex`).not.toContain("IBM Plex");
    }
  });
});
