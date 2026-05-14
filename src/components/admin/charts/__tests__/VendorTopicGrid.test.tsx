import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { VendorTopicGrid } from "../VendorTopicGrid";
import type { VendorTopicCell } from "@/lib/admin/ecosystem-stats";

const cell: VendorTopicCell = {
  vendorName: "Acme",
  vendorId: "acme-1",
  topics: ["dc-networking", "sdn-nfv"],
  productTopics: { "Switch X": ["dc-networking"] },
};

describe("VendorTopicGrid", () => {
  it("renders no data for empty array", () => {
    render(<VendorTopicGrid data={[]} lang="en" />);
    expect(screen.getByText("No data")).toBeDefined();
  });

  it("uses CSS grid layout", () => {
    const { container } = render(<VendorTopicGrid data={[cell]} lang="en" />);
    const grid = container.querySelector(".grid.gap-px");
    expect(grid).not.toBeNull();
    expect(grid?.getAttribute("style")).toContain("120px");
  });

  it("renders square color blocks with inline backgroundColor", () => {
    const { container } = render(<VendorTopicGrid data={[cell]} lang="en" />);
    const blocks = container.querySelectorAll(".h-7.rounded-sm[style*='background-color']");
    expect(blocks.length).toBeGreaterThan(0);
  });

  it("does not use SVG circles", () => {
    const { container } = render(<VendorTopicGrid data={[cell]} lang="en" />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(0);
  });

  it("uses contents class for row grouping", () => {
    const { container } = render(<VendorTopicGrid data={[cell]} lang="en" />);
    const contents = container.querySelector(".contents");
    expect(contents).not.toBeNull();
  });

  it("renders vendor name as link", () => {
    render(<VendorTopicGrid data={[cell]} lang="en" />);
    const link = screen.getByText("Acme");
    expect(link.closest("a")?.getAttribute("href")).toBe("/admin/vendors/acme-1");
  });

  it("renders legend with square blocks (not circles)", () => {
    const { container } = render(<VendorTopicGrid data={[cell]} lang="en" />);
    expect(screen.getByText("Product match")).toBeDefined();
    expect(screen.getByText("Topic only")).toBeDefined();
    const legendSvgs = container.querySelectorAll("svg");
    expect(legendSvgs.length).toBe(0);
  });

  it("shows tooltip on hover", () => {
    const { container } = render(<VendorTopicGrid data={[cell]} lang="en" />);
    const coloredCell = container.querySelector(".h-7.rounded-sm[style*='background-color']") as HTMLElement;
    fireEvent.mouseEnter(coloredCell);
    expect(container.querySelector(".bg-slate-900\\/\\[0\\.92\\]")).not.toBeNull();
  });

  it("applies hover:scale-110 on cells", () => {
    const { container } = render(<VendorTopicGrid data={[cell]} lang="en" />);
    const el = container.querySelector("[class*='hover:scale-110']");
    expect(el).not.toBeNull();
  });
});
