import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const root = join(process.cwd(), "src");

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf-8");
}

describe("mobile responsive fixes (Issue #221)", () => {
  describe("chart min-width 320→280", () => {
    const files = [
      "components/admin/charts/Heatmap.tsx",
      "components/admin/charts/TopicHeatMatrix.tsx",
      "components/admin/charts/VendorTopicGrid.tsx",
    ];

    for (const file of files) {
      it(`${file} uses min-w-[280px] instead of min-w-[320px]`, () => {
        const content = read(file);
        expect(content).toContain("min-w-[280px]");
        expect(content).not.toContain("min-w-[320px]");
      });
    }
  });

  describe("date input responsive width", () => {
    const files = [
      "app/admin/jobs/JobsContent.tsx",
      "app/admin/news/NewsContent.tsx",
      "app/admin/papers/PapersClient.tsx",
    ];

    for (const file of files) {
      it(`${file} uses w-full sm:w-[130px]`, () => {
        const content = read(file);
        expect(content).toContain("w-full sm:w-[130px]");
        expect(content).not.toMatch(/(?<!\S)w-\[130px\]/);
      });
    }
  });

  describe("text max-width mobile fallback", () => {
    it("jobs/page.tsx uses max-w-full sm:max-w-[300px]", () => {
      const content = read("app/admin/jobs/page.tsx");
      expect(content).toContain("max-w-full sm:max-w-[300px]");
    });

    it("news/page.tsx uses max-w-full sm:max-w-[300px]", () => {
      const content = read("app/admin/news/page.tsx");
      expect(content).toContain("max-w-full sm:max-w-[300px]");
    });

    it("news/page.tsx uses max-w-full sm:max-w-[200px] for snippet", () => {
      const content = read("app/admin/news/page.tsx");
      expect(content).toContain("max-w-full sm:max-w-[200px]");
    });

    it("papers/PapersClient.tsx uses max-w-full sm:max-w-[300px]", () => {
      const content = read("app/admin/papers/PapersClient.tsx");
      expect(content).toContain("max-w-full sm:max-w-[300px]");
    });

    it("leads/page.tsx uses max-w-full sm:max-w-[240px]", () => {
      const content = read("app/admin/leads/page.tsx");
      expect(content).toContain("max-w-full sm:max-w-[240px]");
    });

    it("leads/page.tsx uses max-w-full sm:max-w-[200px]", () => {
      const content = read("app/admin/leads/page.tsx");
      expect(content).toContain("max-w-full sm:max-w-[200px]");
    });

    it("conferences/page.tsx uses max-w-full sm:max-w-[220px]", () => {
      const content = read("app/admin/conferences/page.tsx");
      expect(content).toContain("max-w-full sm:max-w-[220px]");
    });

    it("no bare max-w-[NNNpx] without sm: breakpoint in modified files", () => {
      const files = [
        "app/admin/jobs/page.tsx",
        "app/admin/news/page.tsx",
        "app/admin/papers/PapersClient.tsx",
        "app/admin/leads/page.tsx",
        "app/admin/conferences/page.tsx",
      ];
      for (const file of files) {
        const content = read(file);
        const bareMaxW = content.match(/(?<!sm:)max-w-\[\d+px\]/g) ?? [];
        const filtered = bareMaxW.filter((m) => !m.startsWith("max-w-full"));
        expect(filtered, `${file} has bare max-w-[Npx] without sm: prefix`).toEqual([]);
      }
    });
  });

  describe("stats grid smooth transition", () => {
    it("conferences/[id]/page.tsx uses grid-cols-2 sm:grid-cols-3 lg:grid-cols-5", () => {
      const content = read("app/admin/conferences/[id]/page.tsx");
      expect(content).toContain("grid-cols-2 sm:grid-cols-3 lg:grid-cols-5");
      expect(content).not.toContain("grid-cols-2 sm:grid-cols-5");
    });

    it("insights/page.tsx uses grid-cols-2 sm:grid-cols-3 lg:grid-cols-5", () => {
      const content = read("app/admin/insights/page.tsx");
      expect(content).toContain("grid-cols-2 sm:grid-cols-3 lg:grid-cols-5");
    });
  });

  describe("empty state padding", () => {
    it("conferences/[id]/page.tsx uses responsive padding px-4 sm:px-6 py-8 sm:py-16", () => {
      const content = read("app/admin/conferences/[id]/page.tsx");
      expect(content).toContain("px-4 sm:px-6 py-8 sm:py-16");
      expect(content).not.toMatch(/(?<!\S)px-6 py-16(?!\S)/);
    });
  });
});
