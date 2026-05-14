import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopicHeatmap } from "../TopicHeatmap";
import type { TopicStat } from "@/lib/admin/topic-aggregator";

const stat: TopicStat = {
  slug: "dc-networking",
  category: "network-systems",
  counts: { papers: 5, conferences: 3, talents: 2, opensource: 0 },
  total: 10,
  items: { papers: [], conferences: [], talents: [], opensource: [] },
};

const labels: Record<string, string> = {
  papers: "Papers",
  conferences: "Conferences",
  talents: "Talents",
  opensource: "Open Source",
};

describe("TopicHeatmap", () => {
  it("uses CSS grid layout without bg-line", () => {
    const { container } = render(
      <TopicHeatmap stats={[stat]} lang="en" entityLabels={labels} />,
    );
    const grid = container.querySelector(".grid.gap-px");
    expect(grid).not.toBeNull();
    expect(grid?.classList.contains("bg-line")).toBe(false);
    expect(grid?.getAttribute("style")).toContain("180px");
  });

  it("renders fixed-height color blocks with getHeatColor (not rgba)", () => {
    const { container } = render(
      <TopicHeatmap stats={[stat]} lang="en" entityLabels={labels} />,
    );
    const cells = container.querySelectorAll(".h-7.rounded-sm[style*='background-color']");
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      expect(cell.getAttribute("style")).not.toContain("rgba");
    }
  });

  it("hides numbers by default with opacity-0", () => {
    const { container } = render(
      <TopicHeatmap stats={[stat]} lang="en" entityLabels={labels} />,
    );
    const hidden = container.querySelector(".opacity-0.group-hover\\:opacity-100");
    expect(hidden).not.toBeNull();
  });

  it("does not use bg-surface class", () => {
    const { container } = render(
      <TopicHeatmap stats={[stat]} lang="en" entityLabels={labels} />,
    );
    expect(container.querySelector(".bg-surface")).toBeNull();
  });

  it("renders Less / More legend", () => {
    render(<TopicHeatmap stats={[stat]} lang="en" entityLabels={labels} />);
    expect(screen.getByText("Less")).toBeDefined();
    expect(screen.getByText("More")).toBeDefined();
  });

  it("applies hover:scale-110 on cells", () => {
    const { container } = render(
      <TopicHeatmap stats={[stat]} lang="en" entityLabels={labels} />,
    );
    const cell = container.querySelector("[class*='hover:scale-110']");
    expect(cell).not.toBeNull();
  });

  it("renders entity labels", () => {
    render(<TopicHeatmap stats={[stat]} lang="en" entityLabels={labels} />);
    expect(screen.getByText("Papers")).toBeDefined();
    expect(screen.getByText("Conferences")).toBeDefined();
    expect(screen.getByText("Talents")).toBeDefined();
    expect(screen.getByText("Open Source")).toBeDefined();
  });

  it("uses contents class for row grouping", () => {
    const { container } = render(
      <TopicHeatmap stats={[stat]} lang="en" entityLabels={labels} />,
    );
    expect(container.querySelector(".contents")).not.toBeNull();
  });

  it("does not render count=0 cells with color", () => {
    const { container } = render(
      <TopicHeatmap stats={[stat]} lang="en" entityLabels={labels} />,
    );
    const allCells = container.querySelectorAll(".h-7.rounded-sm");
    const coloredCells = container.querySelectorAll(".h-7.rounded-sm[style*='background-color']");
    expect(allCells.length).toBe(4);
    expect(coloredCells.length).toBe(3);
  });
});
