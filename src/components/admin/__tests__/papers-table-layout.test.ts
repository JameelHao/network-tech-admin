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
  const listPages = [
    "jobs/page.tsx",
    "leads/page.tsx",
    "talents/page.tsx",
  ];

  it.each(listPages)("%s has <h1> before the card container", (file) => {
    const content = readFile(file);
    const h1Pos = content.indexOf("<h1");
    const cardPos = content.indexOf('className="rounded-lg border border-line bg-surface');
    expect(h1Pos).toBeGreaterThan(-1);
    expect(cardPos).toBeGreaterThan(-1);
    expect(h1Pos).toBeLessThan(cardPos);
  });

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

  it("section titles are outside their card containers", () => {
    const h2Positions = [...content.matchAll(/<h2/g)].map((m) => m.index!);
    const cardDivPositions = [...content.matchAll(/className="rounded-lg border border-line bg-surface/g)].map((m) => m.index!);

    expect(h2Positions.length).toBeGreaterThanOrEqual(4);

    for (const h2Pos of h2Positions) {
      const nextCard = cardDivPositions.find((cp) => cp > h2Pos);
      if (nextCard !== undefined) {
        const between = content.slice(h2Pos, nextCard);
        expect(between).not.toContain('className="rounded-lg border border-line bg-surface');
      }
    }
  });

  it("stageDistribution title is outside the card", () => {
    const stagePos = content.indexOf("t.dashboard.stageDistribution");
    const nextCardPos = content.indexOf("rounded-lg border border-line bg-surface p-5", stagePos);
    expect(stagePos).toBeGreaterThan(-1);
    expect(nextCardPos).toBeGreaterThan(-1);
    expect(stagePos).toBeLessThan(nextCardPos);
  });
});
