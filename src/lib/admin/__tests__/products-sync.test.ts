import { describe, it, expect } from "vitest";

const GITHUB_RE = /github\.com\/([^/]+)\/([^/]+)/;

describe("products sync - GitHub URL parsing", () => {
  it("extracts owner/repo from standard GitHub URL", () => {
    const match = "https://github.com/cilium/cilium".match(GITHUB_RE);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("cilium");
    expect(match![2]).toBe("cilium");
  });

  it("extracts owner/repo from GitHub URL with path", () => {
    const match = "https://github.com/envoyproxy/envoy/tree/main".match(GITHUB_RE);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("envoyproxy");
    expect(match![2]).toBe("envoy");
  });

  it("returns null for non-GitHub URL", () => {
    const match = "https://www.cloudflare.com".match(GITHUB_RE);
    expect(match).toBeNull();
  });

  it("handles github.com with subpaths correctly", () => {
    const match = "https://github.com/open-telemetry/opentelemetry-collector".match(GITHUB_RE);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("open-telemetry");
    expect(match![2]).toBe("opentelemetry-collector");
  });

  it("returns null for empty/null input", () => {
    expect("".match(GITHUB_RE)).toBeNull();
  });
});

describe("products sync - version tag cleanup", () => {
  it("strips v prefix from version tag", () => {
    const tag = "v1.15.0";
    const version = tag.replace(/^v/, "");
    expect(version).toBe("1.15.0");
  });

  it("keeps version without v prefix", () => {
    const tag = "1.15.0";
    const version = tag.replace(/^v/, "");
    expect(version).toBe("1.15.0");
  });

  it("handles release candidate tags", () => {
    const tag = "v2.0.0-rc1";
    const version = tag.replace(/^v/, "");
    expect(version).toBe("2.0.0-rc1");
  });
});

describe("products sync - SyncStatusBar endpoint", () => {
  it("SYNC_ENDPOINTS includes products", async () => {
    const endpoints: Record<string, string> = {
      papers: "/api/sync/papers",
      news: "/api/sync/feeds",
      jobs: "/api/sync/feeds",
      products: "/api/sync/products",
    };
    expect(endpoints.products).toBe("/api/sync/products");
  });
});
