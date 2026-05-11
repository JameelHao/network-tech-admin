import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSortable } from "../useSortable";

type Item = Record<string, unknown> & { name: string; stars: number; date: string | null };

const items: Item[] = [
  { name: "Charlie", stars: 50, date: "2025-03-01" },
  { name: "Alice", stars: 200, date: "2025-01-01" },
  { name: "Bob", stars: 100, date: null },
];

describe("useSortable", () => {
  it("returns data unchanged when no default sort", () => {
    const { result } = renderHook(() => useSortable(items));
    expect(result.current.sorted).toEqual(items);
    expect(result.current.sortKey).toBeNull();
    expect(result.current.sortDir).toBeNull();
  });

  it("applies default sort on mount", () => {
    const { result } = renderHook(() =>
      useSortable(items, { key: "name", dir: "asc" }),
    );
    expect(result.current.sorted.map((i) => i.name)).toEqual(["Alice", "Bob", "Charlie"]);
    expect(result.current.sortKey).toBe("name");
    expect(result.current.sortDir).toBe("asc");
  });

  it("sorts numbers descending", () => {
    const { result } = renderHook(() =>
      useSortable(items, { key: "stars", dir: "desc" }),
    );
    expect(result.current.sorted.map((i) => i.stars)).toEqual([200, 100, 50]);
  });

  it("sorts numbers ascending", () => {
    const { result } = renderHook(() =>
      useSortable(items, { key: "stars", dir: "asc" }),
    );
    expect(result.current.sorted.map((i) => i.stars)).toEqual([50, 100, 200]);
  });

  it("places null values last regardless of direction", () => {
    const { result } = renderHook(() =>
      useSortable(items, { key: "date", dir: "asc" }),
    );
    const dates = result.current.sorted.map((i) => i.date);
    expect(dates[dates.length - 1]).toBeNull();
  });

  it("toggles sort via onSort", () => {
    const { result } = renderHook(() => useSortable(items));

    act(() => result.current.onSort("name", "asc"));
    expect(result.current.sortKey).toBe("name");
    expect(result.current.sortDir).toBe("asc");
    expect(result.current.sorted.map((i) => i.name)).toEqual(["Alice", "Bob", "Charlie"]);

    act(() => result.current.onSort("name", "desc"));
    expect(result.current.sortDir).toBe("desc");
    expect(result.current.sorted.map((i) => i.name)).toEqual(["Charlie", "Bob", "Alice"]);

    act(() => result.current.onSort("name", null));
    expect(result.current.sortKey).toBeNull();
    expect(result.current.sortDir).toBeNull();
    expect(result.current.sorted).toEqual(items);
  });

  it("switches to a different column", () => {
    const { result } = renderHook(() =>
      useSortable(items, { key: "name", dir: "asc" }),
    );

    act(() => result.current.onSort("stars", "desc"));
    expect(result.current.sortKey).toBe("stars");
    expect(result.current.sorted.map((i) => i.stars)).toEqual([200, 100, 50]);
  });

  it("does not mutate original data", () => {
    const original = [...items];
    const { result } = renderHook(() =>
      useSortable(items, { key: "stars", dir: "asc" }),
    );
    expect(items).toEqual(original);
    expect(result.current.sorted).not.toBe(items);
  });
});
