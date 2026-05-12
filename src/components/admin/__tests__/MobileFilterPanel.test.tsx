import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileFilterPanel } from "../MobileFilterPanel";

describe("MobileFilterPanel", () => {
  it("renders trigger button with label", () => {
    render(
      <MobileFilterPanel label="Filter">
        <input placeholder="search" />
      </MobileFilterPanel>,
    );
    expect(screen.getByRole("button", { name: /Filter/ })).toBeDefined();
  });

  it("hides children by default", () => {
    render(
      <MobileFilterPanel label="Filter">
        <input placeholder="search" />
      </MobileFilterPanel>,
    );
    expect(screen.queryByPlaceholderText("search")).toBeNull();
  });

  it("shows children when clicked", () => {
    render(
      <MobileFilterPanel label="Filter">
        <input placeholder="search" />
      </MobileFilterPanel>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Filter/ }));
    expect(screen.getByPlaceholderText("search")).toBeDefined();
  });

  it("shows active count badge when > 0", () => {
    render(
      <MobileFilterPanel label="Filter" activeCount={3}>
        <div />
      </MobileFilterPanel>,
    );
    expect(screen.getByText("3")).toBeDefined();
  });

  it("does not show badge when activeCount is 0", () => {
    const { container } = render(
      <MobileFilterPanel label="Filter" activeCount={0}>
        <div />
      </MobileFilterPanel>,
    );
    expect(container.querySelector(".rounded-full")).toBeNull();
  });

  it("has lg:hidden class on wrapper", () => {
    const { container } = render(
      <MobileFilterPanel label="Filter">
        <div />
      </MobileFilterPanel>,
    );
    expect(container.firstElementChild?.className).toContain("lg:hidden");
  });

  it("sets aria-expanded correctly", () => {
    render(
      <MobileFilterPanel label="Filter">
        <div />
      </MobileFilterPanel>,
    );
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });
});
