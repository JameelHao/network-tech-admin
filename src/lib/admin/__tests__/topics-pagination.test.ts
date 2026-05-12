import { describe, it, expect } from "vitest";
import { dict } from "@/lib/i18n/dict";

describe("topics pagination", () => {
  describe("i18n keys", () => {
    it("has showing label in both languages", () => {
      expect(dict.en.topics.showing).toBe("Showing");
      expect(dict.zh.topics.showing).toBe("显示");
    });

    it("has ofTopics label in both languages", () => {
      expect(dict.en.topics.ofTopics).toBe("of");
      expect(dict.zh.topics.ofTopics).toBe("共");
    });

    it("has rows and page labels for PaginationClient", () => {
      expect(dict.en.common.rows).toBeDefined();
      expect(dict.en.common.page).toBeDefined();
      expect(dict.zh.common.rows).toBeDefined();
      expect(dict.zh.common.page).toBeDefined();
    });

    it("has all existing topics keys intact", () => {
      expect(dict.en.topics.title).toBe("Topic Management");
      expect(dict.en.topics.table).toBe("Table");
      expect(dict.en.topics.heatmap).toBe("Heatmap");
      expect(dict.en.topics.search).toBe("Search topics…");
      expect(dict.en.topics.total).toBe("Total");
      expect(dict.en.topics.noTopics).toBe("No topics found");
      expect(dict.zh.topics.title).toBe("主题管理");
      expect(dict.zh.topics.table).toBe("表格");
      expect(dict.zh.topics.heatmap).toBe("热力图");
    });
  });

  describe("pagination logic", () => {
    it("calculates correct total pages", () => {
      const PAGE_SIZE = 10;
      expect(Math.ceil(27 / PAGE_SIZE)).toBe(3);
      expect(Math.ceil(10 / PAGE_SIZE)).toBe(1);
      expect(Math.ceil(0 / PAGE_SIZE)).toBe(0);
      expect(Math.ceil(11 / PAGE_SIZE)).toBe(2);
    });

    it("slices data correctly for each page", () => {
      const PAGE_SIZE = 10;
      const data = Array.from({ length: 27 }, (_, i) => i);

      const page1 = data.slice(0, PAGE_SIZE);
      expect(page1).toHaveLength(10);
      expect(page1[0]).toBe(0);
      expect(page1[9]).toBe(9);

      const page2 = data.slice(PAGE_SIZE, PAGE_SIZE * 2);
      expect(page2).toHaveLength(10);
      expect(page2[0]).toBe(10);

      const page3 = data.slice(PAGE_SIZE * 2, PAGE_SIZE * 3);
      expect(page3).toHaveLength(7);
      expect(page3[0]).toBe(20);
      expect(page3[6]).toBe(26);
    });

    it("handles empty data", () => {
      const PAGE_SIZE = 10;
      const data: number[] = [];
      const totalPages = Math.ceil(data.length / PAGE_SIZE);
      expect(totalPages).toBe(0);
      expect(data.slice(0, PAGE_SIZE)).toHaveLength(0);
    });
  });
});
