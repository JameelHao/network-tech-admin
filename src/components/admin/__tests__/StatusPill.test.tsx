import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusPill } from "../StatusPill";

describe("StatusPill", () => {
  it("renders with role=status", () => {
    render(<StatusPill label="tracking" />);
    const pill = screen.getByRole("status");
    expect(pill).toBeDefined();
    expect(pill.textContent).toContain("tracking");
  });

  it("sets aria-label when statusLabel is provided", () => {
    render(<StatusPill label="new" statusLabel="Status" />);
    const pill = screen.getByRole("status");
    expect(pill.getAttribute("aria-label")).toBe("Status: new");
  });

  it("omits aria-label when statusLabel is not provided", () => {
    render(<StatusPill label="archived" />);
    const pill = screen.getByRole("status");
    expect(pill.getAttribute("aria-label")).toBeNull();
  });

  it("hides decorative dot from screen readers", () => {
    const { container } = render(<StatusPill label="evaluating" />);
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot).not.toBeNull();
  });
});
