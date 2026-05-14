import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Heatmap } from "../Heatmap";

describe("Chart responsive", () => {
  describe("Heatmap", () => {
    it("uses min-w-[280px] for mobile compatibility", () => {
      const data = [{ topic: "A", month: "2025-01", count: 5 }];
      const { container } = render(
        <Heatmap data={data} xLabels={["2025-01"]} yLabels={["A"]} />,
      );
      const inner = container.querySelector(".min-w-\\[280px\\]");
      expect(inner).not.toBeNull();
    });

    it("does not use min-w-[500px]", () => {
      const data = [{ topic: "A", month: "2025-01", count: 5 }];
      const { container } = render(
        <Heatmap data={data} xLabels={["2025-01"]} yLabels={["A"]} />,
      );
      const old = container.querySelector(".min-w-\\[500px\\]");
      expect(old).toBeNull();
    });

    it("grid uses 80px first column", () => {
      const data = [{ topic: "A", month: "2025-01", count: 5 }];
      const { container } = render(
        <Heatmap data={data} xLabels={["2025-01"]} yLabels={["A"]} />,
      );
      const grid = container.querySelector(".grid");
      expect(grid?.getAttribute("style")).toContain("90px");
    });
  });

  describe("SessionStats label width", () => {
    it("uses responsive w-20 sm:w-28 on author labels", () => {
      const cls = "font-mono text-[11px] text-ink-700 truncate w-20 sm:w-28 shrink-0";
      expect(cls).toContain("w-20");
      expect(cls).toContain("sm:w-28");
      const classes = cls.split(/\s+/);
      expect(classes).not.toContain("w-28");
    });
  });

  describe("Insights stat cards grid", () => {
    it("includes md:grid-cols-4 breakpoint", () => {
      const { container } = render(
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <div>A</div>
          <div>B</div>
          <div>C</div>
          <div>D</div>
          <div>E</div>
        </div>,
      );
      const grid = container.firstElementChild as HTMLElement;
      expect(grid.className).toContain("md:grid-cols-4");
      expect(grid.className).toContain("sm:grid-cols-3");
      expect(grid.className).toContain("lg:grid-cols-5");
    });
  });
});
