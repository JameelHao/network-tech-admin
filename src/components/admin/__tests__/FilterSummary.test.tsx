import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterSummary } from "../FilterSummary";

const labels = { activeFilters: "Filtering", clearAll: "Clear all" };

describe("FilterSummary", () => {
  it("renders nothing when no filters", () => {
    const { container } = render(
      <FilterSummary filters={[]} labels={labels} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders filter chips", () => {
    render(
      <FilterSummary
        filters={[
          { label: "Language", value: "Go" },
          { label: "Topic", value: "SDN" },
        ]}
        labels={labels}
      />,
    );
    expect(screen.getByText("Language=Go")).toBeDefined();
    expect(screen.getByText("Topic=SDN")).toBeDefined();
    expect(screen.getByText("Filtering")).toBeDefined();
  });

  it("renders clear link when clearHref provided", () => {
    render(
      <FilterSummary
        filters={[{ label: "Stage", value: "new" }]}
        labels={labels}
        clearHref="/admin/test"
      />,
    );
    const link = screen.getByText("Clear all");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/admin/test");
  });

  it("renders clear button when onClear provided", () => {
    const onClear = vi.fn();
    render(
      <FilterSummary
        filters={[{ label: "Stage", value: "new" }]}
        labels={labels}
        onClear={onClear}
      />,
    );
    const btn = screen.getByText("Clear all");
    expect(btn.tagName).toBe("BUTTON");
    fireEvent.click(btn);
    expect(onClear).toHaveBeenCalledOnce();
  });
});
