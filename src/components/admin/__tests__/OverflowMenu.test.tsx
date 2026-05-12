import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OverflowMenu } from "../OverflowMenu";

describe("OverflowMenu", () => {
  it("renders trigger button", () => {
    render(
      <OverflowMenu>
        <a href="/export">Export</a>
      </OverflowMenu>,
    );
    expect(screen.getByRole("button")).toBeDefined();
  });

  it("hides children by default", () => {
    render(
      <OverflowMenu>
        <a href="/export">Export CSV</a>
      </OverflowMenu>,
    );
    expect(screen.queryByText("Export CSV")).toBeNull();
  });

  it("shows children when clicked", () => {
    render(
      <OverflowMenu>
        <a href="/export">Export CSV</a>
      </OverflowMenu>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Export CSV")).toBeDefined();
  });

  it("has lg:hidden class", () => {
    const { container } = render(
      <OverflowMenu>
        <div />
      </OverflowMenu>,
    );
    expect(container.firstElementChild?.className).toContain("lg:hidden");
  });

  it("closes on outside click", () => {
    render(
      <div>
        <div data-testid="outside">outside</div>
        <OverflowMenu>
          <a href="/export">Export CSV</a>
        </OverflowMenu>
      </div>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Export CSV")).toBeDefined();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByText("Export CSV")).toBeNull();
  });

  it("sets aria-expanded correctly", () => {
    render(
      <OverflowMenu>
        <div />
      </OverflowMenu>,
    );
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });
});
