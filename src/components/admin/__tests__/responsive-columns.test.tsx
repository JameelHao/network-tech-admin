import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { SortableHeaderClient } from "../SortableHeader";

describe("Responsive column hiding", () => {
  describe("SortableHeaderClient", () => {
    it("renders without className by default", () => {
      const { container } = render(
        <SortableHeaderClient column="name" label="Name" currentSort="name" currentDir="asc" onSort={vi.fn()} />,
      );
      const btn = container.querySelector("button")!;
      expect(btn.className).not.toContain("hidden");
    });
  });

  describe("hidden lg:table-cell pattern", () => {
    it("hides th on mobile with hidden lg:table-cell", () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <th className="hidden lg:table-cell px-4">Topics</th>
              <th className="px-4">Name</th>
            </tr>
          </thead>
        </table>,
      );
      const ths = container.querySelectorAll("th");
      expect(ths[0]!.className).toContain("hidden");
      expect(ths[0]!.className).toContain("lg:table-cell");
      expect(ths[1]!.className).not.toContain("hidden");
    });

    it("hides td on mobile with hidden lg:table-cell", () => {
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <td className="hidden lg:table-cell px-4">Value</td>
              <td className="px-4">Visible</td>
            </tr>
          </tbody>
        </table>,
      );
      const tds = container.querySelectorAll("td");
      expect(tds[0]!.className).toContain("hidden");
      expect(tds[0]!.className).toContain("lg:table-cell");
      expect(tds[1]!.className).not.toContain("hidden");
    });

    it("matching th and td pairs both have hidden class", () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <th className="px-4">Name</th>
              <th className="hidden lg:table-cell px-4">Topics</th>
              <th className="hidden lg:table-cell px-4">Source</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4">Alice</td>
              <td className="hidden lg:table-cell px-4">ML</td>
              <td className="hidden lg:table-cell px-4">Paper</td>
            </tr>
          </tbody>
        </table>,
      );
      const ths = container.querySelectorAll("th");
      const tds = container.querySelectorAll("td");
      for (let i = 0; i < ths.length; i++) {
        const thHidden = ths[i]!.className.includes("hidden");
        const tdHidden = tds[i]!.className.includes("hidden");
        expect(thHidden).toBe(tdHidden);
      }
    });
  });

  describe("stats grid responsive breakpoints", () => {
    it("renders grid-cols-1 sm:grid-cols-2 lg:grid-cols-5", () => {
      const { container } = render(
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px">
          <div>A</div>
          <div>B</div>
          <div>C</div>
          <div>D</div>
          <div>E</div>
        </div>,
      );
      const grid = container.firstElementChild as HTMLElement;
      expect(grid.className).toContain("grid-cols-1");
      expect(grid.className).toContain("sm:grid-cols-2");
      expect(grid.className).toContain("lg:grid-cols-5");
    });
  });
});
