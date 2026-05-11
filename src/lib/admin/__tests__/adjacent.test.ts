import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAdjacentItems } from "../adjacent";

const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: () =>
    Promise.resolve({
      from: mockFrom,
    }),
}));

function buildCurrentChain(row: Record<string, unknown> | null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: row }),
  };
  return chain;
}

function buildAdjacentChain(data: Record<string, unknown>[]) {
  const resolved = Promise.resolve({ data });
  const chain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    then: resolved.then.bind(resolved),
  };
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAdjacentItems", () => {
  it("returns both prev and next when they exist", async () => {
    const currentChain = buildCurrentChain({ start_date: "2026-03-01" });
    const prevChain = buildAdjacentChain([{ id: "prev-1", abbreviation: "NSDI" }]);
    const nextChain = buildAdjacentChain([{ id: "next-1", abbreviation: "EuroSys" }]);

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return currentChain;
      if (callCount === 2) return prevChain;
      return nextChain;
    });

    const result = await getAdjacentItems("conferences", "test-id", "abbreviation", "start_date", false);

    expect(result.prev).toEqual({ id: "prev-1", label: "NSDI" });
    expect(result.next).toEqual({ id: "next-1", label: "EuroSys" });
  });

  it("returns null for both when current record not found", async () => {
    const chain = buildCurrentChain(null);
    mockFrom.mockReturnValue(chain);

    const result = await getAdjacentItems("conferences", "nonexistent", "abbreviation", "start_date", false);

    expect(result.prev).toBeNull();
    expect(result.next).toBeNull();
  });

  it("returns null prev when at the start of the list", async () => {
    const currentChain = buildCurrentChain({ start_date: "2026-01-01" });
    const prevChain = buildAdjacentChain([]);
    const nextChain = buildAdjacentChain([{ id: "next-1", name: "Next Project" }]);

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return currentChain;
      if (callCount === 2) return prevChain;
      return nextChain;
    });

    const result = await getAdjacentItems("opensource", "first-id", "name", "start_date", false);

    expect(result.prev).toBeNull();
    expect(result.next).toEqual({ id: "next-1", label: "Next Project" });
  });

  it("returns null next when at the end of the list", async () => {
    const currentChain = buildCurrentChain({ created_at: "2026-12-31" });
    const prevChain = buildAdjacentChain([{ id: "prev-1", title: "Prev Paper" }]);
    const nextChain = buildAdjacentChain([]);

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return currentChain;
      if (callCount === 2) return prevChain;
      return nextChain;
    });

    const result = await getAdjacentItems("papers", "last-id", "title", "created_at", false);

    expect(result.prev).toEqual({ id: "prev-1", label: "Prev Paper" });
    expect(result.next).toBeNull();
  });

  it("uses id as fallback label when labelColumn is null", async () => {
    const currentChain = buildCurrentChain({ start_date: "2026-06-01" });
    const prevChain = buildAdjacentChain([{ id: "prev-1", abbreviation: null }]);
    const nextChain = buildAdjacentChain([]);

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return currentChain;
      if (callCount === 2) return prevChain;
      return nextChain;
    });

    const result = await getAdjacentItems("conferences", "test-id", "abbreviation", "start_date", false);

    expect(result.prev).toEqual({ id: "prev-1", label: "prev-1" });
  });

  it("queries correct direction for ascending sort", async () => {
    const currentChain = buildCurrentChain({ created_at: "2026-06-01" });
    const prevChain = buildAdjacentChain([{ id: "prev-1", name: "Older" }]);
    const nextChain = buildAdjacentChain([{ id: "next-1", name: "Newer" }]);

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return currentChain;
      if (callCount === 2) return prevChain;
      return nextChain;
    });

    const result = await getAdjacentItems("talent_leads", "mid-id", "name", "created_at", true);

    expect(result.prev).toEqual({ id: "prev-1", label: "Older" });
    expect(result.next).toEqual({ id: "next-1", label: "Newer" });

    expect(prevChain.lt).toHaveBeenCalledWith("created_at", "2026-06-01");
    expect(nextChain.gt).toHaveBeenCalledWith("created_at", "2026-06-01");
  });

  it("queries correct direction for descending sort", async () => {
    const currentChain = buildCurrentChain({ updated_at: "2026-06-01" });
    const prevChain = buildAdjacentChain([{ id: "prev-1", title: "More Recent" }]);
    const nextChain = buildAdjacentChain([{ id: "next-1", title: "Older" }]);

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return currentChain;
      if (callCount === 2) return prevChain;
      return nextChain;
    });

    const result = await getAdjacentItems("leads", "mid-id", "title", "updated_at", false);

    expect(result.prev).toEqual({ id: "prev-1", label: "More Recent" });
    expect(result.next).toEqual({ id: "next-1", label: "Older" });

    expect(prevChain.gt).toHaveBeenCalledWith("updated_at", "2026-06-01");
    expect(nextChain.lt).toHaveBeenCalledWith("updated_at", "2026-06-01");
  });
});
