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

  it("displays translated label for zh", () => {
    render(<StatusPill label="tracking" lang="zh" />);
    const pill = screen.getByRole("status");
    expect(pill.textContent).toContain("跟踪中");
  });

  it("displays translated label for en", () => {
    render(<StatusPill label="new" lang="en" />);
    const pill = screen.getByRole("status");
    expect(pill.textContent).toContain("New");
  });

  it("translates all four stages to zh", () => {
    const expected: Record<string, string> = {
      new: "新建",
      tracking: "跟踪中",
      evaluating: "评估中",
      archived: "已归档",
    };
    for (const [key, zh] of Object.entries(expected)) {
      const { unmount } = render(<StatusPill label={key} lang="zh" />);
      expect(screen.getByRole("status").textContent).toContain(zh);
      unmount();
    }
  });

  it("falls back to raw label for unknown stage", () => {
    render(<StatusPill label="custom-stage" lang="zh" />);
    const pill = screen.getByRole("status");
    expect(pill.textContent).toContain("custom-stage");
  });

  it("falls back to raw label when lang is omitted", () => {
    render(<StatusPill label="tracking" />);
    const pill = screen.getByRole("status");
    expect(pill.textContent).toContain("tracking");
  });

  it("sets aria-label with translated text when statusLabel is provided", () => {
    render(<StatusPill label="new" lang="zh" statusLabel="Status" />);
    const pill = screen.getByRole("status");
    expect(pill.getAttribute("aria-label")).toBe("Status: 新建");
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
