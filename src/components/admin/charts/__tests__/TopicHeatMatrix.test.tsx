import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { TopicHeatMatrix } from "../TopicHeatMatrix";
import type { TopicMatrixRow } from "@/lib/admin/ecosystem-stats";

const row: TopicMatrixRow = {
  slug: "dc-networking",
  category: "network-systems",
  papers: 5,
  conferences: 3,
  products: 2,
  opensource: 1,
  vendors: 4,
  total: 15,
};

describe("TopicHeatMatrix", () => {
  it("renders no data for empty array", () => {
    render(<TopicHeatMatrix data={[]} lang="en" />);
    expect(screen.getByText("No data")).toBeDefined();
  });

  it("uses CSS grid layout", () => {
    const { container } = render(<TopicHeatMatrix data={[row]} lang="en" />);
    const grid = container.querySelector(".grid.gap-px");
    expect(grid).not.toBeNull();
    expect(grid?.getAttribute("style")).toContain("140px");
  });

  it("renders fixed-height color blocks with inline backgroundColor", () => {
    const { container } = render(<TopicHeatMatrix data={[row]} lang="en" />);
    const cells = container.querySelectorAll(".h-7.rounded-sm[style*='background-color']");
    expect(cells.length).toBeGreaterThan(0);
  });

  it("hides numbers by default with opacity-0", () => {
    const { container } = render(<TopicHeatMatrix data={[row]} lang="en" />);
    const hidden = container.querySelector(".opacity-0.group-hover\\:opacity-100");
    expect(hidden).not.toBeNull();
  });

  it("does not render a Total column", () => {
    const { container } = render(<TopicHeatMatrix data={[row]} lang="en" />);
    expect(container.textContent).not.toContain("Total");
  });

  it("renders category group headers spanning full width", () => {
    const { container } = render(<TopicHeatMatrix data={[row]} lang="en" />);
    const catHeader = container.querySelector("[style*='grid-column']");
    expect(catHeader).not.toBeNull();
    expect(catHeader?.getAttribute("style")).toContain("1 / -1");
  });

  it("uses contents class for row grouping", () => {
    const { container } = render(<TopicHeatMatrix data={[row]} lang="en" />);
    const contents = container.querySelector(".contents");
    expect(contents).not.toBeNull();
  });

  it("renders Less / More legend", () => {
    render(<TopicHeatMatrix data={[row]} lang="en" />);
    expect(screen.getByText("Less")).toBeDefined();
    expect(screen.getByText("More")).toBeDefined();
  });

  it("renders dimension labels", () => {
    render(<TopicHeatMatrix data={[row]} lang="en" />);
    expect(screen.getByText("Papers")).toBeDefined();
    expect(screen.getByText("Conf.")).toBeDefined();
    expect(screen.getByText("OSS")).toBeDefined();
  });

  it("applies hover:scale-110 on cells", () => {
    const { container } = render(<TopicHeatMatrix data={[row]} lang="en" />);
    const cell = container.querySelector("[class*='hover:scale-110']");
    expect(cell).not.toBeNull();
  });

  it("navigates on cell click", () => {
    const { container } = render(<TopicHeatMatrix data={[row]} lang="en" />);
    const cell = container.querySelector(".h-7.rounded-sm.cursor-pointer") as HTMLElement;
    cell?.click();
    expect(mockPush).toHaveBeenCalled();
    expect(mockPush.mock.calls[0][0]).toContain("?topic=dc-networking");
  });
});
