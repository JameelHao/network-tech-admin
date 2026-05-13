import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const appDir = path.resolve(__dirname, "../../../app");

describe("font loading via next/font/google", () => {
  const layout = fs.readFileSync(path.join(appDir, "layout.tsx"), "utf-8");
  const globals = fs.readFileSync(path.join(appDir, "globals.css"), "utf-8");

  it("imports fonts from next/font/google", () => {
    expect(layout).toContain('from "next/font/google"');
  });

  it("does not use external Google Fonts link tag", () => {
    expect(layout).not.toContain("fonts.googleapis.com");
  });

  it.each([
    ["--font-inter", "Inter"],
    ["--font-jb-mono", "JetBrains_Mono"],
  ])("declares CSS variable %s for %s", (variable) => {
    expect(layout).toContain(`variable: "${variable}"`);
  });

  it("applies all font variable classes to body", () => {
    expect(layout).toContain("inter.variable");
    expect(layout).toContain("jetbrainsMono.variable");
  });

  it("does not reference old fonts", () => {
    expect(layout).not.toContain("Fraunces");
    expect(layout).not.toContain("IBM_Plex_Sans");
    expect(layout).not.toContain("IBM_Plex_Mono");
    expect(layout).not.toContain("Noto_Serif_SC");
    expect(layout).not.toContain("Noto_Sans_SC");
  });

  it("all fonts use display swap", () => {
    const swapCount = (layout.match(/display:\s*"swap"/g) || []).length;
    expect(swapCount).toBe(2);
  });

  it("globals.css --font-sans uses var(--font-inter)", () => {
    expect(globals).toContain("var(--font-inter)");
    expect(globals).toContain("LXGW WenKai");
  });

  it("globals.css --font-mono uses var(--font-jb-mono)", () => {
    expect(globals).toContain("var(--font-jb-mono)");
    expect(globals).toContain("LXGW WenKai Mono");
  });

  it("globals.css does not define --font-display", () => {
    expect(globals).not.toContain("--font-display");
  });

  it("globals.css does not reference old font variables", () => {
    expect(globals).not.toContain("var(--font-fraunces)");
    expect(globals).not.toContain("var(--font-plex)");
    expect(globals).not.toContain("var(--font-plex-mono)");
    expect(globals).not.toContain("var(--font-noto-serif-sc)");
    expect(globals).not.toContain("var(--font-noto-sans-sc)");
  });

  it("globals.css does not use hardcoded font family strings", () => {
    expect(globals).not.toContain('"Fraunces"');
    expect(globals).not.toContain('"IBM Plex Sans"');
    expect(globals).not.toContain('"IBM Plex Mono"');
    expect(globals).not.toContain('"Noto Sans SC"');
    expect(globals).not.toContain('"Noto Serif SC"');
  });
});
