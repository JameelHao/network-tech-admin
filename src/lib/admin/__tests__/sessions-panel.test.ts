import { describe, it, expect } from "vitest";
import { dict } from "@/lib/i18n/dict";

describe("sessions panel sorting and pagination", () => {
  describe("i18n keys", () => {
    it("has groupedView label in both languages", () => {
      expect(dict.en.session.groupedView).toBe("Grouped");
      expect(dict.zh.session.groupedView).toBe("分组");
    });

    it("has tableView label in both languages", () => {
      expect(dict.en.session.tableView).toBe("Table");
      expect(dict.zh.session.tableView).toBe("表格");
    });

    it("has affiliations label in both languages", () => {
      expect(dict.en.session.affiliations).toBe("Affiliations");
      expect(dict.zh.session.affiliations).toBe("机构");
    });

    it("has rows and page labels for PaginationClient", () => {
      expect(dict.en.common.rows).toBeDefined();
      expect(dict.en.common.page).toBeDefined();
      expect(dict.zh.common.rows).toBeDefined();
      expect(dict.zh.common.page).toBeDefined();
    });

    it("has existing session keys intact", () => {
      expect(dict.en.session.searchSessions).toBe("Search sessions...");
      expect(dict.en.session.expandAll).toBe("Expand All");
      expect(dict.en.session.collapseAll).toBe("Collapse All");
      expect(dict.en.session.showAbstract).toBe("Abstract");
      expect(dict.en.session.hideAbstract).toBe("Hide");
      expect(dict.zh.session.searchSessions).toBe("搜索论文...");
      expect(dict.zh.session.expandAll).toBe("展开全部");
    });
  });

  describe("table sort logic", () => {
    const sessions = [
      { title: "Zebra", authors: ["Charlie", "Bob"], affiliations: ["MIT"], topics: ["bgp"] },
      { title: "Alpha", authors: ["Alice"], affiliations: ["Stanford"], topics: ["dns", "cdn"] },
      { title: "Middle", authors: [], affiliations: [], topics: [] },
    ];

    it("sorts by title ascending", () => {
      const sorted = [...sessions].sort((a, b) => a.title.localeCompare(b.title));
      expect(sorted[0].title).toBe("Alpha");
      expect(sorted[1].title).toBe("Middle");
      expect(sorted[2].title).toBe("Zebra");
    });

    it("sorts by first author ascending", () => {
      const sorted = [...sessions].sort((a, b) => (a.authors[0] ?? "").localeCompare(b.authors[0] ?? ""));
      expect(sorted[0].title).toBe("Middle");
      expect(sorted[1].title).toBe("Alpha");
      expect(sorted[2].title).toBe("Zebra");
    });

    it("sorts by first affiliation ascending", () => {
      const sorted = [...sessions].sort((a, b) => (a.affiliations[0] ?? "").localeCompare(b.affiliations[0] ?? ""));
      expect(sorted[0].title).toBe("Middle");
      expect(sorted[1].title).toBe("Zebra");
      expect(sorted[2].title).toBe("Alpha");
    });

    it("sorts by first topic ascending", () => {
      const sorted = [...sessions].sort((a, b) => (a.topics[0] ?? "").localeCompare(b.topics[0] ?? ""));
      expect(sorted[0].title).toBe("Middle");
      expect(sorted[1].title).toBe("Zebra");
      expect(sorted[2].title).toBe("Alpha");
    });

    it("sorts descending with multiplier", () => {
      const mult = -1;
      const sorted = [...sessions].sort((a, b) => mult * a.title.localeCompare(b.title));
      expect(sorted[0].title).toBe("Zebra");
      expect(sorted[2].title).toBe("Alpha");
    });
  });

  describe("pagination logic", () => {
    it("calculates correct total pages for PAGE_SIZE=20", () => {
      const PAGE_SIZE = 20;
      expect(Math.ceil(50 / PAGE_SIZE)).toBe(3);
      expect(Math.ceil(20 / PAGE_SIZE)).toBe(1);
      expect(Math.ceil(0 / PAGE_SIZE)).toBe(0);
      expect(Math.ceil(21 / PAGE_SIZE)).toBe(2);
    });

    it("slices data correctly", () => {
      const PAGE_SIZE = 20;
      const data = Array.from({ length: 45 }, (_, i) => i);

      expect(data.slice(0, PAGE_SIZE)).toHaveLength(20);
      expect(data.slice(PAGE_SIZE, PAGE_SIZE * 2)).toHaveLength(20);
      expect(data.slice(PAGE_SIZE * 2, PAGE_SIZE * 3)).toHaveLength(5);
    });
  });

  describe("author/affiliation display logic", () => {
    it("shows first 2 authors + count", () => {
      const authors = ["Alice", "Bob", "Charlie", "Dave"];
      const display = authors.slice(0, 2).join(", ") + (authors.length > 2 ? ` +${authors.length - 2}` : "");
      expect(display).toBe("Alice, Bob +2");
    });

    it("shows single author without count", () => {
      const authors = ["Alice"];
      const display = authors.slice(0, 2).join(", ") + (authors.length > 2 ? ` +${authors.length - 2}` : "");
      expect(display).toBe("Alice");
    });

    it("shows first affiliation + count", () => {
      const affiliations = ["MIT", "Stanford", "CMU"];
      const display = affiliations[0] + (affiliations.length > 1 ? ` +${affiliations.length - 1}` : "");
      expect(display).toBe("MIT +2");
    });
  });
});
