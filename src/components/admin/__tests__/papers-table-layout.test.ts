import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const adminDir = path.resolve(__dirname, "../../../app/admin");

function readFile(file: string) {
  return fs.readFileSync(path.join(adminDir, file), "utf-8");
}

describe("PapersClient table layout", () => {
  const content = readFile("papers/PapersClient.tsx");

  it("uses <table> for list view", () => {
    expect(content).toContain("<table");
    expect(content).toContain("<thead>");
    expect(content).toContain("<tbody");
  });

  it("has all required table columns (title, authors, venue, topics, published_date, favorite)", () => {
    expect(content).toContain('column="title"');
    expect(content).toContain("labels.authors");
    expect(content).toContain('column="venue"');
    expect(content).toContain("labels.topics");
    expect(content).toContain('column="published_date"');
    expect(content).toContain("FavoriteButton");
  });

  it("topics and favorite columns are hidden on mobile", () => {
    expect(content).toContain('className="hidden lg:table-cell">{labels.topics}');
    const favThMatch = content.match(/hidden lg:table-cell.*?★/s);
    expect(favThMatch).not.toBeNull();
  });

  it("uses PaginationClient with PAGE_SIZE 25", () => {
    expect(content).toContain("PaginationClient");
    expect(content).toContain("PAGE_SIZE = 25");
  });

  it("uses SortableHeaderClient for title, venue, and published_date", () => {
    const matches = content.match(/SortableHeaderClient/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(3);
  });

  it("renders authors with 2+N truncation", () => {
    expect(content).toContain("authors.slice(0, 2)");
    expect(content).toContain("authors.length > 2");
  });

  it("renders topics with TopicTag capped at 3", () => {
    expect(content).toContain("TopicTag");
    expect(content).toContain("topics.slice(0, 3)");
    expect(content).toContain("topics.length > 3");
  });

  it("wraps table in overflow-x-auto", () => {
    expect(content).toContain("overflow-x-auto");
  });

  it("has Th/Td helper functions", () => {
    expect(content).toContain("function Th(");
    expect(content).toContain("function Td(");
  });

  it("preserves cluster view with PaperRow", () => {
    expect(content).toContain("function PaperRow(");
    expect(content).toContain("clusterByTopics");
    expect(content).toContain("<details");
  });

  it("no longer uses TimeGroupHeader", () => {
    expect(content).not.toContain("TimeGroupHeader");
  });
});

describe("title extraction — titles outside card containers", () => {
  const listPages: string[] = [];

  it("Papers page.tsx has section header before the PapersClient", () => {
    const content = readFile("papers/page.tsx");
    const headerPos = content.indexOf('<header className="mb-6"');
    const clientPos = content.indexOf("<PapersClient");
    expect(headerPos).toBeGreaterThan(-1);
    expect(clientPos).toBeGreaterThan(-1);
    expect(headerPos).toBeLessThan(clientPos);
  });

  it("News page.tsx has section header before the table section", () => {
    const content = readFile("news/page.tsx");
    const headerPos = content.indexOf('<header className="mb-6"');
    const tablePos = content.indexOf('data-fav-filter="news"');
    expect(headerPos).toBeGreaterThan(-1);
    expect(tablePos).toBeGreaterThan(-1);
    expect(headerPos).toBeLessThan(tablePos);
  });

  it("OpenSource page.tsx has section header before the table section", () => {
    const content = readFile("opensource/page.tsx");
    const headerPos = content.indexOf('<header className="mb-6"');
    const tablePos = content.indexOf('data-fav-filter="opensource"');
    expect(headerPos).toBeGreaterThan(-1);
    expect(tablePos).toBeGreaterThan(-1);
    expect(headerPos).toBeLessThan(tablePos);
  });

  it("Jobs page.tsx has section header before the table section", () => {
    const content = readFile("jobs/page.tsx");
    const headerPos = content.indexOf('<header className="mb-6"');
    const tablePos = content.indexOf('data-fav-filter="jobs"');
    expect(headerPos).toBeGreaterThan(-1);
    expect(tablePos).toBeGreaterThan(-1);
    expect(headerPos).toBeLessThan(tablePos);
  });

  it("Leads page.tsx has section header before the table section", () => {
    const content = readFile("leads/page.tsx");
    const headerPos = content.indexOf('<header className="mb-6"');
    const tablePos = content.indexOf('data-fav-filter="leads"');
    expect(headerPos).toBeGreaterThan(-1);
    expect(tablePos).toBeGreaterThan(-1);
    expect(headerPos).toBeLessThan(tablePos);
  });

  it("Talents page.tsx has section header before the table section", () => {
    const content = readFile("talents/page.tsx");
    const headerPos = content.indexOf('<header className="mb-6"');
    const tablePos = content.indexOf('data-fav-filter="talents"');
    expect(headerPos).toBeGreaterThan(-1);
    expect(tablePos).toBeGreaterThan(-1);
    expect(headerPos).toBeLessThan(tablePos);
  });

  it("Products page.tsx has section header before the table section", () => {
    const content = readFile("products/page.tsx");
    const headerPos = content.indexOf('<header className="mb-6"');
    const tablePos = content.indexOf('data-fav-filter="products"');
    expect(headerPos).toBeGreaterThan(-1);
    expect(tablePos).toBeGreaterThan(-1);
    expect(headerPos).toBeLessThan(tablePos);
  });

  it("Vendors page.tsx has section header before the table section", () => {
    const content = readFile("vendors/page.tsx");
    const headerPos = content.indexOf('<header className="mb-6"');
    const tablePos = content.indexOf('data-fav-filter="vendors"');
    expect(headerPos).toBeGreaterThan(-1);
    expect(tablePos).toBeGreaterThan(-1);
    expect(headerPos).toBeLessThan(tablePos);
  });

  it("Topics page.tsx has section header before the content section", () => {
    const content = readFile("topics/page.tsx");
    const headerPos = content.indexOf('<header className="mb-6"');
    const sectionPos = content.indexOf("data-topics-content");
    expect(headerPos).toBeGreaterThan(-1);
    expect(sectionPos).toBeGreaterThan(-1);
    expect(headerPos).toBeLessThan(sectionPos);
  });

  it("Insights page.tsx has section header before the first SectionCard", () => {
    const content = readFile("insights/page.tsx");
    const headerPos = content.indexOf('<header className="mb-6"');
    const sectionCardPos = content.indexOf("<SectionCard");
    expect(headerPos).toBeGreaterThan(-1);
    expect(sectionCardPos).toBeGreaterThan(-1);
    expect(headerPos).toBeLessThan(sectionCardPos);
  });

  it("conferences overview title is outside the stats card", () => {
    const content = readFile("conferences/page.tsx");
    const overviewLabelPos = content.indexOf("t.conf.overview");
    const statsCardPos = content.indexOf('className="mb-4 rounded-lg border');
    expect(overviewLabelPos).toBeGreaterThan(-1);
    expect(statsCardPos).toBeGreaterThan(-1);
    expect(overviewLabelPos).toBeLessThan(statsCardPos);
  });
});

describe("dashboard title extraction", () => {
  const content = readFile("page.tsx");

  it("has mono section titles before their card containers", () => {
    const monoTitlePositions = [...content.matchAll(/font-mono text-\[10px\] uppercase tracking-\[0\.18em\] text-ink-500/g)].map((m) => m.index!);
    const cardDivPositions = [...content.matchAll(/className="rounded-lg border border-line bg-surface/g)].map((m) => m.index!);

    expect(monoTitlePositions.length).toBeGreaterThanOrEqual(4);

    for (const titlePos of monoTitlePositions) {
      const nextCard = cardDivPositions.find((cp) => cp > titlePos);
      if (nextCard !== undefined) {
        const between = content.slice(titlePos, nextCard);
        expect(between).not.toContain('className="rounded-lg border border-line bg-surface');
      }
    }
  });

  it("has header with mono page title", () => {
    const headerPos = content.indexOf('<header className="mb-6"');
    expect(headerPos).toBeGreaterThan(-1);
    expect(content).toContain('font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500');
  });

  it("stageDistribution title is outside the card", () => {
    const stagePos = content.indexOf("t.dashboard.stageDistribution");
    const nextCardPos = content.indexOf("rounded-lg border border-line bg-surface p-5", stagePos);
    expect(stagePos).toBeGreaterThan(-1);
    expect(nextCardPos).toBeGreaterThan(-1);
    expect(stagePos).toBeLessThan(nextCardPos);
  });
});
