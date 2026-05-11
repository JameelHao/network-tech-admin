import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TableSkeleton, CardSkeleton, StatSkeleton } from "../Skeleton";

describe("TableSkeleton", () => {
  it("renders correct number of rows", () => {
    const { container } = render(<TableSkeleton rows={3} cols={4} />);
    const rows = container.querySelectorAll(".divide-y > div");
    expect(rows.length).toBe(3);
  });

  it("renders correct number of pulse elements per row", () => {
    const { container } = render(<TableSkeleton rows={1} cols={3} />);
    const pulses = container.querySelectorAll(".animate-pulse");
    expect(pulses.length).toBe(3);
  });

  it("uses default values", () => {
    const { container } = render(<TableSkeleton />);
    const rows = container.querySelectorAll(".divide-y > div");
    expect(rows.length).toBe(5);
  });
});

describe("CardSkeleton", () => {
  it("renders header and table skeleton", () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelector(".border")).not.toBeNull();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});

describe("StatSkeleton", () => {
  it("renders correct number of stat blocks", () => {
    const { container } = render(<StatSkeleton count={3} />);
    const blocks = container.querySelectorAll(".bg-surface");
    expect(blocks.length).toBe(3);
  });

  it("uses default count of 4", () => {
    const { container } = render(<StatSkeleton />);
    const blocks = container.querySelectorAll(".bg-surface");
    expect(blocks.length).toBe(4);
  });
});
