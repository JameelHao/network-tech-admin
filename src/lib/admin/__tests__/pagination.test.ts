import { describe, it, expect } from "vitest";
import { parsePaginationParams, buildResult } from "../pagination";

describe("parsePaginationParams", () => {
  it("returns defaults when no params provided", () => {
    const result = parsePaginationParams({});
    expect(result).toEqual({ page: 1, pageSize: 50, search: undefined });
  });

  it("parses valid page and size", () => {
    const result = parsePaginationParams({ page: "3", size: "25" });
    expect(result).toEqual({ page: 3, pageSize: 25, search: undefined });
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
