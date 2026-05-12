import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimeRangeBar } from "../TimeRangeBar";

const labels = { today: "Today", week: "This Week", month: "This Month", all: "All" };

describe("TimeRangeBar", () => {
  it("renders all range buttons", () => {
    render(<TimeRangeBar value="" onChange={() => {}} labels={labels} />);
    expect(screen.getByText("Today")).toBeDefined();
    expect(screen.getByText("This Week")).toBeDefined();
    expect(screen.getByText("This Month")).toBeDefined();
    expect(screen.getByText("All")).toBeDefined();
  });

  it("highlights active range", () => {
    const { container } = render(<TimeRangeBar value="today" onChange={() => {}} labels={labels} />);
    const activeBtn = screen.getByText("Today");
    expect(activeBtn.className).toContain("bg-navy-700");
  });

  it("calls onChange with selected range", () => {
    const onChange = vi.fn();
    render(<TimeRangeBar value="" onChange={onChange} labels={labels} />);
    fireEvent.click(screen.getByText("This Week"));
    expect(onChange).toHaveBeenCalledWith("week");
  });

  it("calls onChange with empty string for 'all'", () => {
    const onChange = vi.fn();
    render(<TimeRangeBar value="today" onChange={onChange} labels={labels} />);
    fireEvent.click(screen.getByText("All"));
    expect(onChange).toHaveBeenCalledWith("");
  });
});
