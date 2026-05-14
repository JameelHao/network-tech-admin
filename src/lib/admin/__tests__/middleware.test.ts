import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { join } from "path";

describe("middleware.ts", () => {
  const middlewarePath = join(process.cwd(), "src/middleware.ts");
  const proxyPath = join(process.cwd(), "src/proxy.ts");

  it("src/middleware.ts exists", () => {
    expect(existsSync(middlewarePath)).toBe(true);
  });

  it("src/proxy.ts no longer exists", () => {
    expect(existsSync(proxyPath)).toBe(false);
  });

  it("exports a function named middleware", async () => {
    const mod = await import("@/middleware");
    expect(typeof mod.middleware).toBe("function");
  });

  it("does not export a function named proxy", async () => {
    const mod = await import("@/middleware");
    expect((mod as Record<string, unknown>).proxy).toBeUndefined();
  });

  it("exports config with correct matcher", async () => {
    const mod = await import("@/middleware");
    expect(mod.config).toBeDefined();
    expect(mod.config.matcher).toEqual(["/admin/:path*", "/login"]);
  });
});
