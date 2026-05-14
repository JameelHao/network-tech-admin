import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heatmap } from "../Heatmap";

describe("Heatmap", () => {
  const data = [
    { topic: "AI", month: "2024-01", count: 5 },
    { topic: "AI", month: "2024-02", count: 10 },
    { topic: "ML", month: "2024-01", count: 0 },
    { topic: "ML", month: "2024-02", count: 3 },
  ];
  const xLabels = ["2024-01", "2024-02"];
  const yLabels = ["AI", "ML"];

  it("renders topic labels", () => {
    render(<Heatmap data={data} xLabels={xLabels} yLabels={yLabels} />);
    expect(screen.getByText("AI")).toBeDefined();
    expect(screen.getByText("ML")).toBeDefined();
  });

  it("renders month labels (stripped prefix)", () => {
    render(<Heatmap data={data} xLabels={xLabels} yLabels={yLabels} />);
    expect(screen.getByText("01")).toBeDefined();
    expect(screen.getByText("02")).toBeDefined();
  });

  it("renders color scale legend", () => {
    render(<Heatmap data={data} xLabels={xLabels} yLabels={yLabels} />);
    expect(screen.getByText("Less")).toBeDefined();
    expect(screen.getByText("More")).toBeDefined();
  });

  it("applies 10-level heatmap colors via inline style", () => {
    const { container } = render(
      <Heatmap data={data} xLabels={xLabels} yLabels={yLabels} />,
    );
    const cells = container.querySelectorAll("[style*='background-color']");
    expect(cells.length).toBeGreaterThan(0);
  });

  it("renders no data for empty array", () => {
    render(<Heatmap data={[]} xLabels={[]} yLabels={[]} />);
    expect(screen.getByText("No data")).toBeDefined();
  });

  it("applies hover scale class on cells", () => {
    const { container } = render(
      <Heatmap data={data} xLabels={xLabels} yLabels={yLabels} />,
    );
    const cell = container.querySelector("[class*='hover:scale-110']");
    expect(cell).not.toBeNull();
  });
});
