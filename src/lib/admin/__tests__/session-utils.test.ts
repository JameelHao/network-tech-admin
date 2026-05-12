import { describe, it, expect } from "vitest";
import {
  groupSessionsByTopic,
  getTopAuthors,
  getTopAffiliations,
  getTopicDistribution,
} from "../session-utils";
import type { ConferenceSession } from "../types";

function makeSession(overrides: Partial<ConferenceSession> = {}): ConferenceSession {
  return {
    id: "s1",
    conference_id: "c1",
    title: "Test",
    authors: [],
    topics: [],
    affiliations: [],
    url: null,
    abstract: null,
    notes: null,
    created_at: "2026-01-01",
    ...overrides,
  };
}

describe("groupSessionsByTopic", () => {
  it("groups sessions by first topic", () => {
    const sessions = [
      makeSession({ id: "1", topics: ["networking", "security"] }),
      makeSession({ id: "2", topics: ["networking"] }),
      makeSession({ id: "3", topics: ["security"] }),
    ];
    const groups = groupSessionsByTopic(sessions);
    expect(groups).toHaveLength(2);
    expect(groups[0].topic).toBe("networking");
    expect(groups[0].sessions).toHaveLength(2);
    expect(groups[1].topic).toBe("security");
    expect(groups[1].sessions).toHaveLength(1);
  });

  it("assigns sessions without topics to 'other'", () => {
    const sessions = [makeSession({ id: "1", topics: [] })];
    const groups = groupSessionsByTopic(sessions);
    expect(groups).toHaveLength(1);
    expect(groups[0].topic).toBe("other");
  });

  it("sorts groups by count descending", () => {
    const sessions = [
      makeSession({ id: "1", topics: ["a"] }),
      makeSession({ id: "2", topics: ["b"] }),
      makeSession({ id: "3", topics: ["b"] }),
      makeSession({ id: "4", topics: ["b"] }),
    ];
    const groups = groupSessionsByTopic(sessions);
    expect(groups[0].topic).toBe("b");
    expect(groups[0].sessions).toHaveLength(3);
    expect(groups[1].topic).toBe("a");
  });

  it("returns empty array for no sessions", () => {
    expect(groupSessionsByTopic([])).toEqual([]);
  });
});

describe("getTopAuthors", () => {
  it("counts and ranks authors", () => {
    const sessions = [
      makeSession({ id: "1", authors: ["Alice", "Bob"] }),
      makeSession({ id: "2", authors: ["Alice", "Charlie"] }),
      makeSession({ id: "3", authors: ["Alice"] }),
    ];
    const top = getTopAuthors(sessions, 2);
    expect(top).toHaveLength(2);
    expect(top[0]).toEqual({ name: "Alice", count: 3 });
    expect(top[1].count).toBeLessThanOrEqual(3);
  });

  it("respects limit", () => {
    const sessions = [
      makeSession({ id: "1", authors: ["A", "B", "C", "D"] }),
    ];
    expect(getTopAuthors(sessions, 2)).toHaveLength(2);
  });

  it("returns empty for no sessions", () => {
    expect(getTopAuthors([])).toEqual([]);
  });
});

describe("getTopAffiliations", () => {
  it("counts and ranks affiliations", () => {
    const sessions = [
      makeSession({ id: "1", affiliations: ["MIT", "Google"] }),
      makeSession({ id: "2", affiliations: ["MIT"] }),
      makeSession({ id: "3", affiliations: ["Stanford", "Google"] }),
    ];
    const top = getTopAffiliations(sessions, 3);
    expect(top[0]).toEqual({ name: "MIT", count: 2 });
    expect(top[1]).toEqual({ name: "Google", count: 2 });
    expect(top[2]).toEqual({ name: "Stanford", count: 1 });
  });

  it("returns empty for no sessions", () => {
    expect(getTopAffiliations([])).toEqual([]);
  });
});

describe("getTopicDistribution", () => {
  it("counts all topics (not just first)", () => {
    const sessions = [
      makeSession({ id: "1", topics: ["networking", "security"] }),
      makeSession({ id: "2", topics: ["networking"] }),
    ];
    const dist = getTopicDistribution(sessions);
    expect(dist).toHaveLength(2);
    expect(dist[0]).toEqual({ topic: "networking", count: 2, pct: 67 });
    expect(dist[1]).toEqual({ topic: "security", count: 1, pct: 33 });
  });

  it("sorts by count descending", () => {
    const sessions = [
      makeSession({ id: "1", topics: ["a"] }),
      makeSession({ id: "2", topics: ["b"] }),
      makeSession({ id: "3", topics: ["b"] }),
    ];
    const dist = getTopicDistribution(sessions);
    expect(dist[0].topic).toBe("b");
  });

  it("returns empty for no sessions", () => {
    expect(getTopicDistribution([])).toEqual([]);
  });
});
