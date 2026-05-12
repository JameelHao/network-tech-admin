import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

const STORAGE_KEY = "nta-favorites";

const store: Record<string, string> = {};
const mockStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    for (const k of Object.keys(store)) delete store[k];
  }),
  get length() {
    return Object.keys(store).length;
  },
  key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
};

vi.stubGlobal("localStorage", mockStorage);

import { useFavorites, useFavoritesAll } from "../useFavorites";

function clearStore() {
  for (const k of Object.keys(store)) delete store[k];
  mockStorage.getItem.mockClear();
  mockStorage.setItem.mockClear();
}

describe("useFavorites", () => {
  beforeEach(() => {
    clearStore();
  });

  it("starts with empty favorites", () => {
    const { result } = renderHook(() => useFavorites("conferences"));
    expect(result.current.count).toBe(0);
    expect(result.current.favIds.size).toBe(0);
  });

  it("toggle adds an item", () => {
    const { result } = renderHook(() => useFavorites("conferences"));
    act(() => result.current.toggle("id-1", "SIGCOMM"));
    expect(result.current.isFav("id-1")).toBe(true);
    expect(result.current.count).toBe(1);
  });

  it("toggle removes an existing item", () => {
    const { result } = renderHook(() => useFavorites("conferences"));
    act(() => result.current.toggle("id-1", "SIGCOMM"));
    act(() => result.current.toggle("id-1"));
    expect(result.current.isFav("id-1")).toBe(false);
    expect(result.current.count).toBe(0);
  });

  it("persists to localStorage with label", () => {
    const { result } = renderHook(() => useFavorites("papers"));
    act(() => result.current.toggle("p-1", "My Paper"));
    const raw = store[STORAGE_KEY];
    expect(raw).toBeTruthy();
    const data = JSON.parse(raw);
    expect(data.papers).toHaveLength(1);
    expect(data.papers[0].id).toBe("p-1");
    expect(data.papers[0].label).toBe("My Paper");
    expect(data.papers[0].ts).toBeGreaterThan(0);
  });

  it("uses id as label fallback", () => {
    const { result } = renderHook(() => useFavorites("leads"));
    act(() => result.current.toggle("l-1"));
    const data = JSON.parse(store[STORAGE_KEY]);
    expect(data.leads[0].label).toBe("l-1");
  });

  it("isolates favorites by entity", () => {
    const { result: confHook } = renderHook(() => useFavorites("conferences"));
    act(() => confHook.current.toggle("c-1", "SIGCOMM"));

    const { result: paperHook } = renderHook(() => useFavorites("papers"));
    expect(confHook.current.count).toBe(1);
    expect(paperHook.current.count).toBe(0);
  });

  it("isFav returns false for non-existent item", () => {
    const { result } = renderHook(() => useFavorites("conferences"));
    expect(result.current.isFav("non-existent")).toBe(false);
  });

  it("handles corrupted localStorage gracefully", () => {
    store[STORAGE_KEY] = "not-json";
    const { result } = renderHook(() => useFavorites("conferences"));
    expect(result.current.count).toBe(0);
  });

  it("handles missing entity key gracefully", () => {
    store[STORAGE_KEY] = JSON.stringify({ papers: [] });
    const { result } = renderHook(() => useFavorites("conferences"));
    expect(result.current.count).toBe(0);
  });

  it("multiple toggles work correctly", () => {
    const { result } = renderHook(() => useFavorites("opensource"));
    act(() => result.current.toggle("a", "A"));
    act(() => result.current.toggle("b", "B"));
    act(() => result.current.toggle("c", "C"));
    expect(result.current.count).toBe(3);
    act(() => result.current.toggle("b"));
    expect(result.current.count).toBe(2);
    expect(result.current.isFav("a")).toBe(true);
    expect(result.current.isFav("b")).toBe(false);
    expect(result.current.isFav("c")).toBe(true);
  });
});

describe("useFavoritesAll", () => {
  beforeEach(() => {
    clearStore();
  });

  it("returns empty when no favorites", () => {
    const { result } = renderHook(() => useFavoritesAll());
    expect(result.current.recent).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it("aggregates across entities", () => {
    store[STORAGE_KEY] = JSON.stringify({
      conferences: [{ id: "c-1", ts: 1000, label: "SIGCOMM" }],
      papers: [{ id: "p-1", ts: 2000, label: "Paper A" }],
      leads: [],
      talents: [],
      opensource: [],
    });
    const { result } = renderHook(() => useFavoritesAll());
    expect(result.current.totalCount).toBe(2);
    expect(result.current.recent).toHaveLength(2);
  });

  it("sorts recent by timestamp descending", () => {
    store[STORAGE_KEY] = JSON.stringify({
      conferences: [{ id: "c-1", ts: 1000, label: "Old" }],
      papers: [{ id: "p-1", ts: 3000, label: "New" }],
      leads: [{ id: "l-1", ts: 2000, label: "Mid" }],
      talents: [],
      opensource: [],
    });
    const { result } = renderHook(() => useFavoritesAll());
    expect(result.current.recent[0].id).toBe("p-1");
    expect(result.current.recent[1].id).toBe("l-1");
    expect(result.current.recent[2].id).toBe("c-1");
  });

  it("limits to 5 most recent", () => {
    store[STORAGE_KEY] = JSON.stringify({
      conferences: Array.from({ length: 7 }, (_, i) => ({
        id: `c-${i}`,
        ts: i * 1000,
        label: `C${i}`,
      })),
      papers: [],
      leads: [],
      talents: [],
      opensource: [],
    });
    const { result } = renderHook(() => useFavoritesAll());
    expect(result.current.recent).toHaveLength(5);
    expect(result.current.totalCount).toBe(7);
  });

  it("includes entity type in recent items", () => {
    store[STORAGE_KEY] = JSON.stringify({
      conferences: [{ id: "c-1", ts: 1000, label: "Conf" }],
      papers: [],
      leads: [{ id: "l-1", ts: 2000, label: "Lead" }],
      talents: [],
      opensource: [],
    });
    const { result } = renderHook(() => useFavoritesAll());
    expect(result.current.recent[0].entity).toBe("leads");
    expect(result.current.recent[1].entity).toBe("conferences");
  });

  it("handles corrupted localStorage gracefully", () => {
    store[STORAGE_KEY] = "{broken";
    const { result } = renderHook(() => useFavoritesAll());
    expect(result.current.totalCount).toBe(0);
    expect(result.current.recent).toEqual([]);
  });
});
