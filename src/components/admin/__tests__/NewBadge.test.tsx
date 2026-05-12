import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewBadge } from "../NewBadge";

describe("NewBadge", () => {
  it("renders the label text", () => {
    render(<NewBadge label="NEW" />);
    expect(screen.getByText("NEW")).toBeDefined();
  });

  it("renders as a span element", () => {
    render(<NewBadge label="NEW" />);
    expect(screen.getByText("NEW").tagName).toBe("SPAN");
  });

  it("has emerald styling", () => {
    render(<NewBadge label="NEW" />);
    const el = screen.getByText("NEW");
    expect(el.className).toContain("bg-emerald-100");
    expect(el.className).toContain("text-emerald-700");
  });
});
