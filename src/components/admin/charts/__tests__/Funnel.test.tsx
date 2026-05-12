import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Funnel } from "../Funnel";

describe("Funnel", () => {
  const data = [
    { name: "new", value: 100 },
    { name: "tracking", value: 60 },
    { name: "evaluating", value: 30 },
    { name: "archived", value: 10 },
  ];

  it("renders all stages", () => {
    render(<Funnel data={data} />);
    expect(screen.getByText("new")).toBeDefined();
    expect(screen.getByText("tracking")).toBeDefined();
    expect(screen.getByText("evaluating")).toBeDefined();
    expect(screen.getByText("archived")).toBeDefined();
  });

  it("shows percentage labels", () => {
    render(<Funnel data={data} />);
    expect(screen.getByText("(50%)")).toBeDefined();
    expect(screen.getByText("(30%)")).toBeDefined();
    expect(screen.getByText("(15%)")).toBeDefined();
    expect(screen.getByText("(5%)")).toBeDefined();
  });

  it("applies gradient backgrounds", () => {
    const { container } = render(<Funnel data={data} />);
    const bars = container.querySelectorAll("[style*='linear-gradient']");
    expect(bars.length).toBe(4);
  });

  it("renders no data message for empty array", () => {
    render(<Funnel data={[]} />);
    expect(screen.getByText("No data")).toBeDefined();
  });
});
