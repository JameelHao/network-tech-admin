import { describe, it, expect } from "vitest";
import { computeOpenSourceStats } from "../opensource-utils";
import type { OpenSource } from "../types";

function makeProject(overrides: Partial<OpenSource> = {}): OpenSource {
  return {
    id: "1",
    name: "Test Project",
    repo_url: "https://github.com/test/test",
    description: null,
    language: null,
    stars: null,
    last_active: null,
    topics: [],
    notes: null,
    created_at: "2026-01-01",
    ...overrides,
  };
}

const NOW = new Date("2026-05-14T12:00:00Z").getTime();

describe("computeOpenSourceStats", () => {
  it("returns all zeros for empty array", () => {
    const stats = computeOpenSourceStats([], NOW);
    expect(stats.total).toBe(0);
    expect(stats.active).toBe(0);
    expect(stats.highStars).toBe(0);
    expect(stats.languageCount).toBe(0);
  });

  it("returns total count", () => {
    const projects = [makeProject({ id: "1" }), makeProject({ id: "2" }), makeProject({ id: "3" })];
    expect(computeOpenSourceStats(projects, NOW).total).toBe(3);
  });

  it("counts active projects (last_active within 90 days)", () => {
    const projects = [
      makeProject({ id: "1", last_active: "2026-05-10" }),
      makeProject({ id: "2", last_active: "2026-03-01" }),
      makeProject({ id: "3", last_active: "2026-01-01" }),
      makeProject({ id: "4", last_active: null }),
    ];
    expect(computeOpenSourceStats(projects, NOW).active).toBe(2);
  });

  it("excludes projects with null last_active from active count", () => {
    const projects = [makeProject({ id: "1", last_active: null })];
    expect(computeOpenSourceStats(projects, NOW).active).toBe(0);
  });

  it("boundary: project exactly 90 days ago is included in active", () => {
    const ninetyDaysAgo = new Date(NOW - 90 * 86_400_000).toISOString().slice(0, 10);
    const projects = [makeProject({ id: "1", last_active: ninetyDaysAgo })];
    expect(computeOpenSourceStats(projects, NOW).active).toBe(1);
  });

  it("boundary: project 91 days ago is excluded from active", () => {
    const ninetyOneDaysAgo = new Date(NOW - 91 * 86_400_000).toISOString().slice(0, 10);
    const projects = [makeProject({ id: "1", last_active: ninetyOneDaysAgo })];
    expect(computeOpenSourceStats(projects, NOW).active).toBe(0);
  });

  it("counts high stars projects (stars >= 5000)", () => {
    const projects = [
      makeProject({ id: "1", stars: 10000 }),
      makeProject({ id: "2", stars: 5000 }),
      makeProject({ id: "3", stars: 4999 }),
      makeProject({ id: "4", stars: null }),
    ];
    expect(computeOpenSourceStats(projects, NOW).highStars).toBe(2);
  });

  it("boundary: stars exactly 5000 is included", () => {
    const projects = [makeProject({ id: "1", stars: 5000 })];
    expect(computeOpenSourceStats(projects, NOW).highStars).toBe(1);
  });

  it("boundary: stars 4999 is excluded", () => {
    const projects = [makeProject({ id: "1", stars: 4999 })];
    expect(computeOpenSourceStats(projects, NOW).highStars).toBe(0);
  });

  it("excludes null stars from highStars", () => {
    const projects = [makeProject({ id: "1", stars: null })];
    expect(computeOpenSourceStats(projects, NOW).highStars).toBe(0);
  });

  it("counts distinct languages", () => {
    const projects = [
      makeProject({ id: "1", language: "Go" }),
      makeProject({ id: "2", language: "Rust" }),
      makeProject({ id: "3", language: "Go" }),
      makeProject({ id: "4", language: null }),
    ];
    expect(computeOpenSourceStats(projects, NOW).languageCount).toBe(2);
  });

  it("excludes null language from count", () => {
    const projects = [
      makeProject({ id: "1", language: null }),
      makeProject({ id: "2", language: null }),
    ];
    expect(computeOpenSourceStats(projects, NOW).languageCount).toBe(0);
  });

  it("handles single project with all fields", () => {
    const projects = [makeProject({
      id: "1",
      language: "Python",
      stars: 12000,
      last_active: "2026-05-01",
    })];
    const stats = computeOpenSourceStats(projects, NOW);
    expect(stats.total).toBe(1);
    expect(stats.active).toBe(1);
    expect(stats.highStars).toBe(1);
    expect(stats.languageCount).toBe(1);
  });
});
