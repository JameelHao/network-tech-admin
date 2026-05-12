import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkipToMain } from "../SkipToMain";

describe("SkipToMain", () => {
  it("renders a link targeting #main-content", () => {
    render(<SkipToMain label="Skip to main content" />);
    const link = screen.getByText("Skip to main content");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("#main-content");
  });

  it("has sr-only class for screen reader accessibility", () => {
    render(<SkipToMain label="Skip" />);
    const link = screen.getByText("Skip");
    expect(link.className).toContain("sr-only");
  });
});
