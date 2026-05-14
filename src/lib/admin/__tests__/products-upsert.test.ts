import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CloudProductInput } from "../products";

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockIn = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    from: () => ({
      select: (...args: unknown[]) => {
        mockSelect(...args);
        return { in: mockIn };
      },
      insert: (data: unknown) => {
        mockInsert(data);
        return { error: null };
      },
      update: (data: unknown) => {
        mockUpdate(data);
        return {
          eq: (col: string, val: string) => {
            mockEq(col, val);
            return { error: null };
          },
        };
      },
    }),
  }),
}));

import { upsertCloudProducts } from "../products";

const baseItem: CloudProductInput = {
  name: "Test Product",
  vendor: "aws",
  category: "platform",
  description: "A test product",
  url: "https://aws.amazon.com/test",
  pricing: "paid",
  topics: ["cloud-infra"],
  source_url: "https://aws.amazon.com/feed/test",
  published_at: "2026-01-01T00:00:00Z",
};

describe("upsertCloudProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns zeros for empty input", async () => {
    const result = await upsertCloudProducts([]);
    expect(result).toEqual({ inserted: 0, updated: 0 });
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("inserts new items when source_url not found", async () => {
    mockIn.mockResolvedValueOnce({ data: [] });

    const result = await upsertCloudProducts([baseItem]);

    expect(result.inserted).toBe(1);
    expect(result.updated).toBe(0);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Product",
        vendor: "aws",
        source: "cloud-releases",
        source_url: "https://aws.amazon.com/feed/test",
      }),
    );
  });

  it("updates existing items by source_url match", async () => {
    mockIn.mockResolvedValueOnce({
      data: [{ id: "existing-id-1", source_url: baseItem.source_url }],
    });

    const result = await upsertCloudProducts([baseItem]);

    expect(result.inserted).toBe(0);
    expect(result.updated).toBe(1);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "A test product",
        topics: ["cloud-infra"],
        published_at: "2026-01-01T00:00:00Z",
      }),
    );
    expect(mockEq).toHaveBeenCalledWith("id", "existing-id-1");
  });

  it("does not overwrite stage or notes on update", async () => {
    mockIn.mockResolvedValueOnce({
      data: [{ id: "existing-id-1", source_url: baseItem.source_url }],
    });

    await upsertCloudProducts([baseItem]);

    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg).not.toHaveProperty("stage");
    expect(updateArg).not.toHaveProperty("notes");
    expect(updateArg).not.toHaveProperty("name");
    expect(updateArg).not.toHaveProperty("vendor");
  });

  it("sets source to cloud-releases on insert", async () => {
    mockIn.mockResolvedValueOnce({ data: [] });

    await upsertCloudProducts([baseItem]);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ source: "cloud-releases" }),
    );
  });

  it("handles mixed insert and update", async () => {
    const item2: CloudProductInput = {
      ...baseItem,
      name: "Another Product",
      source_url: "https://aws.amazon.com/feed/other",
    };

    mockIn.mockResolvedValueOnce({
      data: [{ id: "existing-1", source_url: baseItem.source_url }],
    });

    const result = await upsertCloudProducts([baseItem, item2]);

    expect(result.inserted).toBe(1);
    expect(result.updated).toBe(1);
  });

  it("queries existing records by source_url", async () => {
    mockIn.mockResolvedValueOnce({ data: [] });

    await upsertCloudProducts([baseItem]);

    expect(mockSelect).toHaveBeenCalledWith("id, source_url");
    expect(mockIn).toHaveBeenCalledWith("source_url", [baseItem.source_url]);
  });
});
