import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileFilterBar } from "../MobileFilterBar";

describe("MobileFilterBar", () => {
  it("renders toggle button with label", () => {
    render(
      <MobileFilterBar label="Filter">
        <input placeholder="Search..." />
      </MobileFilterBar>,
    );
    expect(screen.getByRole("button", { name: /filter/i })).toBeDefined();
  });

  it("hides children by default on mobile", () => {
    render(
      <MobileFilterBar label="Filter">
        <input placeholder="Search..." />
      </MobileFilterBar>,
    );
    const container = screen.getByPlaceholderText("Search...").parentElement!;
    expect(container.className).toContain("hidden");
  });

  it("shows children after toggle click", () => {
    render(
      <MobileFilterBar label="Filter">
        <input placeholder="Search..." />
      </MobileFilterBar>,
    );
    fireEvent.click(screen.getByRole("button", { name: /filter/i }));
    const container = screen.getByPlaceholderText("Search...").parentElement!;
    expect(container.className).not.toContain("hidden");
    expect(container.className).toContain("flex");
  });

  it("toggles aria-expanded attribute", () => {
    render(
      <MobileFilterBar label="Filter">
        <span>content</span>
      </MobileFilterBar>,
    );
    const btn = screen.getByRole("button", { name: /filter/i });
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("always shows children on lg via CSS class", () => {
    render(
      <MobileFilterBar label="Filter">
        <input placeholder="Search..." />
      </MobileFilterBar>,
    );
    const container = screen.getByPlaceholderText("Search...").parentElement!;
    expect(container.className).toContain("lg:flex");
  });
});
