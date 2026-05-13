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
    ["--font-fraunces", "Fraunces"],
    ["--font-plex", "IBM_Plex_Sans"],
    ["--font-plex-mono", "IBM_Plex_Mono"],
    ["--font-noto-serif-sc", "Noto_Serif_SC"],
    ["--font-noto-sans-sc", "Noto_Sans_SC"],
  ])("declares CSS variable %s for %s", (variable) => {
    expect(layout).toContain(`variable: "${variable}"`);
  });

  it("applies all font variable classes to body", () => {
    expect(layout).toContain("fraunces.variable");
    expect(layout).toContain("plexSans.variable");
    expect(layout).toContain("plexMono.variable");
    expect(layout).toContain("notoSerifSC.variable");
    expect(layout).toContain("notoSansSC.variable");
  });

  it("all fonts use display swap", () => {
    const swapCount = (layout.match(/display:\s*"swap"/g) || []).length;
    expect(swapCount).toBe(5);
  });

  it("globals.css --font-display uses var(--font-fraunces)", () => {
    expect(globals).toContain("var(--font-fraunces)");
    expect(globals).toContain("var(--font-noto-serif-sc)");
  });

  it("globals.css --font-sans uses var(--font-plex)", () => {
    expect(globals).toContain("var(--font-plex)");
    expect(globals).toContain("var(--font-noto-sans-sc)");
  });

  it("globals.css --font-mono uses var(--font-plex-mono)", () => {
    expect(globals).toContain("var(--font-plex-mono)");
  });

  it("globals.css does not use hardcoded font family strings", () => {
    expect(globals).not.toContain('"Fraunces"');
    expect(globals).not.toContain('"IBM Plex Sans"');
    expect(globals).not.toContain('"IBM Plex Mono"');
    expect(globals).not.toContain('"Noto Sans SC"');
    expect(globals).not.toContain('"Noto Serif SC"');
  });
});
