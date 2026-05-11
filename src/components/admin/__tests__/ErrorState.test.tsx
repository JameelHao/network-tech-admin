import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState } from "../ErrorState";

describe("ErrorState", () => {
  it("renders error message", () => {
    render(<ErrorState message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeDefined();
  });

  it("renders retry button when onRetry provided", () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} retryLabel="Try Again" />);
    const btn = screen.getByText("Try Again");
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not render retry button when onRetry is absent", () => {
    render(<ErrorState message="Error" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("uses default retry label", () => {
    render(<ErrorState message="Error" onRetry={() => {}} />);
    expect(screen.getByText("Retry")).toBeDefined();
  });
});
