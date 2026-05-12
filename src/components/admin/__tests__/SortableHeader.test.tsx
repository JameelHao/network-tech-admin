import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { SortableHeaderClient } from "../SortableHeader";

describe("SortableHeaderClient a11y", () => {
  it("sets aria-pressed=true when active column", () => {
    const { container } = render(
      <SortableHeaderClient column="title" label="Title" currentSort="title" currentDir="asc" onSort={vi.fn()} />,
    );
    const btn = container.querySelector("button");
    expect(btn?.getAttribute("aria-pressed")).toBe("true");
  });

  it("sets aria-pressed=false when not active column", () => {
    const { container } = render(
      <SortableHeaderClient column="title" label="Title" currentSort="date" currentDir="asc" onSort={vi.fn()} />,
    );
    const btn = container.querySelector("button");
    expect(btn?.getAttribute("aria-pressed")).toBe("false");
  });
});
