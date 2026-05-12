import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { SortableHeaderClient } from "../SortableHeader";

describe("SortableHeaderClient a11y", () => {
  it("sets aria-sort=ascending when sorted asc", () => {
    const { container } = render(
      <SortableHeaderClient column="title" label="Title" currentSort="title" currentDir="asc" onSort={vi.fn()} />,
    );
    const btn = container.querySelector("button");
    expect(btn?.getAttribute("aria-sort")).toBe("ascending");
  });

  it("sets aria-sort=descending when sorted desc", () => {
    const { container } = render(
      <SortableHeaderClient column="title" label="Title" currentSort="title" currentDir="desc" onSort={vi.fn()} />,
    );
    const btn = container.querySelector("button");
    expect(btn?.getAttribute("aria-sort")).toBe("descending");
  });

  it("sets aria-sort=none when not active column", () => {
    const { container } = render(
      <SortableHeaderClient column="title" label="Title" currentSort="date" currentDir="asc" onSort={vi.fn()} />,
    );
    const btn = container.querySelector("button");
    expect(btn?.getAttribute("aria-sort")).toBe("none");
  });
});
