import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/admin/papers",
}));

import { useFilterParams } from "../useFilterParams";

describe("useFilterParams", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  it("get returns empty string for missing key", () => {
    const { result } = renderHook(() => useFilterParams());
    expect(result.current.get("keyword")).toBe("");
  });

  it("get returns param value", () => {
    mockSearchParams = new URLSearchParams("keyword=react");
    const { result } = renderHook(() => useFilterParams());
    expect(result.current.get("keyword")).toBe("react");
  });

  it("set adds param and removes page", () => {
    mockSearchParams = new URLSearchParams("page=3");
    const { result } = renderHook(() => useFilterParams());
    act(() => result.current.set("venue", "SIGCOMM"));
    expect(mockReplace).toHaveBeenCalledWith(
      "/admin/papers?venue=SIGCOMM",
      { scroll: false },
    );
  });

  it("set with empty value removes param", () => {
    mockSearchParams = new URLSearchParams("keyword=test");
    const { result } = renderHook(() => useFilterParams());
    act(() => result.current.set("keyword", ""));
    expect(mockReplace).toHaveBeenCalledWith("/admin/papers", { scroll: false });
  });

  it("remove deletes param", () => {
    mockSearchParams = new URLSearchParams("keyword=test&venue=X");
    const { result } = renderHook(() => useFilterParams());
    act(() => result.current.remove("keyword"));
    expect(mockReplace).toHaveBeenCalledWith(
      "/admin/papers?venue=X",
      { scroll: false },
    );
  });

  it("clearAll navigates to bare path", () => {
    mockSearchParams = new URLSearchParams("keyword=test&venue=X");
    const { result } = renderHook(() => useFilterParams());
    act(() => result.current.clearAll());
    expect(mockReplace).toHaveBeenCalledWith("/admin/papers", { scroll: false });
  });

  it("activeEntries excludes system params", () => {
    mockSearchParams = new URLSearchParams("keyword=test&page=2&sort=name&dir=asc&venue=X");
    const { result } = renderHook(() => useFilterParams());
    const keys = result.current.activeEntries.map((e) => e.key);
    expect(keys).toContain("keyword");
    expect(keys).toContain("venue");
    expect(keys).not.toContain("page");
    expect(keys).not.toContain("sort");
    expect(keys).not.toContain("dir");
  });
});
