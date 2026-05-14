import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("dashboard layout - single column", () => {
  const source = readFileSync(
    join(process.cwd(), "src/app/admin/page.tsx"),
    "utf-8",
  );

  it("does not use grid lg:grid-cols-2 for list sections", () => {
    expect(source).not.toContain('grid lg:grid-cols-2');
  });

  it("has section elements as direct main children (no grid wrapper)", () => {
    const gridWrapperCount = (source.match(/<div className="grid lg:grid-cols-2/g) || []).length;
    expect(gridWrapperCount).toBe(0);
  });

  it("still has all 6 dashboard sections", () => {
    expect(source).toContain("upcomingConferences");
    expect(source).toContain("latestPapers");
    expect(source).toContain("latestNews");
    expect(source).toContain("latestProductUpdates");
    expect(source).toContain("keyVendors");
    expect(source).toContain("latestLeads");
  });
});
