import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No data" description="Try again later." />);
    expect(screen.getByText("No data")).toBeDefined();
    expect(screen.getByText("Try again later.")).toBeDefined();
  });

  it("renders compact mode without icon", () => {
    const { container } = render(
      <EmptyState title="Empty" description="Hint" compact />
    );
    expect(container.querySelector("svg")).toBeNull();
    expect(screen.getByText("Empty")).toBeDefined();
  });

  it("renders action link", () => {
    render(
      <EmptyState
        title="Nothing here"
        description="Get started"
        action={{ label: "Create", href: "/new" }}
      />
    );
    const link = screen.getByText("Create");
    expect(link.closest("a")?.getAttribute("href")).toBe("/new");
  });

  it("renders action button", () => {
    render(
      <EmptyState
        title="Nothing here"
        description="Get started"
        action={{ label: "Retry", onClick: () => {} }}
      />
    );
    expect(screen.getByText("Retry").tagName).toBe("BUTTON");
  });

  it("renders default icon in full mode", () => {
    const { container } = render(
      <EmptyState title="No items" description="Nothing to show." />
    );
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
