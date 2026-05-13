import { describe, it, expect } from "vitest";
import { TOPICS, TOPIC_MAP, TOPIC_CATEGORIES, getTopicLabel, getTopicCategory, getCategoryColor } from "../topics";

describe("topics", () => {
  it("has 35 topics total", () => {
    expect(TOPICS).toHaveLength(35);
  });

  it("has unique slugs", () => {
    const slugs = TOPICS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("does not contain deprecated 5g-wireless slug", () => {
    const slugs = TOPICS.map((t) => t.slug);
    expect(slugs).not.toContain("5g-wireless");
  });

  it("contains all 8 new topic slugs", () => {
    const slugs = new Set(TOPICS.map((t) => t.slug));
    const newSlugs = [
      "ai-networking", "network-digital-twin", "intent-based-networking",
      "satellite-leo", "quantum-networking",
      "zero-trust", "sase-sse",
      "network-observability",
    ];
    for (const s of newSlugs) {
      expect(slugs.has(s)).toBe(true);
    }
  });

  it("assigns new emerging topics to emerging category", () => {
    const emergingSlugs = ["ai-networking", "network-digital-twin", "intent-based-networking", "satellite-leo", "quantum-networking"];
    for (const s of emergingSlugs) {
      expect(TOPIC_MAP[s]?.category).toBe("emerging");
    }
  });

  it("assigns new security topics to security category", () => {
    expect(TOPIC_MAP["zero-trust"]?.category).toBe("security");
    expect(TOPIC_MAP["sase-sse"]?.category).toBe("security");
  });

  it("assigns network-observability to measurement category", () => {
    expect(TOPIC_MAP["network-observability"]?.category).toBe("measurement");
  });

  it("every topic has non-empty en and zh labels", () => {
    for (const t of TOPICS) {
      expect(t.en.length).toBeGreaterThan(0);
      expect(t.zh.length).toBeGreaterThan(0);
    }
  });

  it("every topic category is valid", () => {
    const validCategories = Object.keys(TOPIC_CATEGORIES);
    for (const t of TOPICS) {
      expect(validCategories).toContain(t.category);
    }
  });

  it("TOPIC_MAP has same count as TOPICS array", () => {
    expect(Object.keys(TOPIC_MAP).length).toBe(TOPICS.length);
  });

  it("getTopicLabel returns label for known slug", () => {
    expect(getTopicLabel("zero-trust", "en")).toBe("Zero Trust Architecture");
    expect(getTopicLabel("zero-trust", "zh")).toBe("零信任架构");
  });

  it("getTopicLabel returns slug for unknown slug", () => {
    expect(getTopicLabel("unknown-slug", "en")).toBe("unknown-slug");
  });

  it("getTopicCategory returns correct category", () => {
    expect(getTopicCategory("ai-networking")).toBe("emerging");
    expect(getTopicCategory("network-observability")).toBe("measurement");
  });

  it("getCategoryColor returns correct color", () => {
    expect(getCategoryColor("security")).toBe("rust");
    expect(getCategoryColor("emerging")).toBe("moss");
  });
});
