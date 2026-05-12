import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartTooltip } from "../ChartTooltip";

describe("ChartTooltip", () => {
  it("renders nothing when inactive", () => {
    const { container } = render(
      <ChartTooltip active={false} payload={[{ value: 42 }]} label="Jan" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when payload is empty", () => {
    const { container } = render(
      <ChartTooltip active={true} payload={[]} label="Jan" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders label and formatted value when active", () => {
    render(
      <ChartTooltip active={true} payload={[{ value: 1234 }]} label="2024-01" />,
    );
    expect(screen.getByText("2024-01")).toBeDefined();
    expect(screen.getByText("1,234")).toBeDefined();
  });

  it("renders without label when label is undefined", () => {
    const { container } = render(
      <ChartTooltip active={true} payload={[{ value: 50 }]} />,
    );
    expect(container.querySelector("p.font-mono")).toBeNull();
    expect(screen.getByText("50")).toBeDefined();
  });

  it("renders string values", () => {
    render(
      <ChartTooltip active={true} payload={[{ value: "hello" }]} label="test" />,
    );
    expect(screen.getByText("hello")).toBeDefined();
  });

  it("has dark glass morphism styling", () => {
    const { container } = render(
      <ChartTooltip active={true} payload={[{ value: 1 }]} label="x" />,
    );
    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip.className).toContain("bg-slate-900");
    expect(tooltip.className).toContain("backdrop-blur");
  });
});
