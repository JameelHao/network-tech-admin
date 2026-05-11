import { describe, it, expect } from "vitest";
import { parsePaginationParams, buildResult, validateSort } from "../pagination";

describe("parsePaginationParams", () => {
  it("returns defaults when no params provided", () => {
    const result = parsePaginationParams({});
    expect(result).toEqual({ page: 1, pageSize: 50, search: undefined, sort: undefined, dir: undefined });
  });

  it("parses valid page and size", () => {
    const result = parsePaginationParams({ page: "3", size: "25" });
    expect(result).toEqual({ page: 3, pageSize: 25, search: undefined, sort: undefined, dir: undefined });
  });

  it("rejects invalid page values", () => {
    expect(parsePaginationParams({ page: "0" }).page).toBe(1);
    expect(parsePaginationParams({ page: "-1" }).page).toBe(1);
    expect(parsePaginationParams({ page: "abc" }).page).toBe(1);
  });

  it("rejects non-allowed page sizes", () => {
    expect(parsePaginationParams({ size: "10" }).pageSize).toBe(50);
    expect(parsePaginationParams({ size: "999" }).pageSize).toBe(50);
    expect(parsePaginationParams({ size: "abc" }).pageSize).toBe(50);
  });

  it("accepts allowed page sizes", () => {
    expect(parsePaginationParams({ size: "25" }).pageSize).toBe(25);
    expect(parsePaginationParams({ size: "50" }).pageSize).toBe(50);
    expect(parsePaginationParams({ size: "100" }).pageSize).toBe(100);
  });

  it("uses custom default pageSize", () => {
    const result = parsePaginationParams({}, { pageSize: 25 });
    expect(result.pageSize).toBe(25);
  });

  it("parses search param", () => {
    expect(parsePaginationParams({ search: "hello" }).search).toBe("hello");
    expect(parsePaginationParams({ search: "  " }).search).toBeUndefined();
    expect(parsePaginationParams({ search: "" }).search).toBeUndefined();
  });

  it("handles array values (takes undefined)", () => {
    const result = parsePaginationParams({ page: ["1", "2"] as unknown as string });
    expect(result.page).toBe(1);
  });

  it("parses sort and dir params", () => {
    const result = parsePaginationParams({ sort: "name", dir: "asc" });
    expect(result.sort).toBe("name");
    expect(result.dir).toBe("asc");
  });

  it("accepts desc direction", () => {
    const result = parsePaginationParams({ sort: "stars", dir: "desc" });
    expect(result.sort).toBe("stars");
    expect(result.dir).toBe("desc");
  });

  it("rejects invalid dir values", () => {
    const result = parsePaginationParams({ sort: "name", dir: "invalid" });
    expect(result.sort).toBe("name");
    expect(result.dir).toBeUndefined();
  });

  it("returns undefined sort for empty string", () => {
    const result = parsePaginationParams({ sort: "" });
    expect(result.sort).toBeUndefined();
  });
});

describe("buildResult", () => {
  it("computes totalPages correctly", () => {
    const result = buildResult(["a", "b"], 10, { page: 1, pageSize: 3 });
    expect(result).toEqual({
      data: ["a", "b"],
      total: 10,
      page: 1,
      pageSize: 3,
      totalPages: 4,
    });
  });

  it("returns at least 1 totalPages for empty data", () => {
    const result = buildResult([], 0, { page: 1, pageSize: 50 });
    expect(result.totalPages).toBe(1);
  });

  it("handles exact division", () => {
    const result = buildResult([], 100, { page: 1, pageSize: 50 });
    expect(result.totalPages).toBe(2);
  });
});

describe("validateSort", () => {
  const allowed = ["name", "stars", "created_at"] as const;

  it("returns requested sort when column is allowed", () => {
    expect(validateSort("name", "asc", allowed, "created_at", "desc"))
      .toEqual({ column: "name", ascending: true });
  });

  it("returns desc as ascending=false", () => {
    expect(validateSort("stars", "desc", allowed, "created_at", "desc"))
      .toEqual({ column: "stars", ascending: false });
  });

  it("falls back to default when column is not in allowed list", () => {
    expect(validateSort("hacked", "asc", allowed, "created_at", "desc"))
      .toEqual({ column: "created_at", ascending: false });
  });

  it("falls back to default when sort is undefined", () => {
    expect(validateSort(undefined, undefined, allowed, "created_at", "desc"))
      .toEqual({ column: "created_at", ascending: false });
  });

  it("falls back to default when dir is missing", () => {
    expect(validateSort("name", undefined, allowed, "created_at", "desc"))
      .toEqual({ column: "created_at", ascending: false });
  });
});
