import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FilterSummary } from "../FilterSummary";
import { EmptyState } from "../EmptyState";

const labels = { activeFilters: "Filtering", clearAll: "Clear all" };

describe("FilterSummary a11y", () => {
  it("has aria-live=polite region", () => {
    const { container } = render(
      <FilterSummary
        filters={[{ label: "Topic", value: "SDN" }]}
        labels={labels}
      />,
    );
    const region = container.querySelector("[aria-live='polite']");
    expect(region).not.toBeNull();
  });

  it("has role=region", () => {
    render(
      <FilterSummary
        filters={[{ label: "Topic", value: "SDN" }]}
        labels={labels}
      />,
    );
    expect(screen.getByRole("region")).toBeDefined();
  });
});

describe("EmptyState a11y", () => {
  it("has role=status in compact mode", () => {
    render(<EmptyState title="No data" description="Try again." compact />);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("has role=status in full mode", () => {
    render(<EmptyState title="No data" description="Try again." />);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("hides decorative icon from screen readers", () => {
    const { container } = render(
      <EmptyState title="Empty" description="Nothing to show." />,
    );
    const hidden = container.querySelector("[aria-hidden='true']");
    expect(hidden).not.toBeNull();
  });
});
