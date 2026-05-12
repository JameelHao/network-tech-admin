import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FilterDateRange, FilterNumberRange, FilterInput } from "../FilterControls";

const mockRouter = { replace: () => {}, push: () => {}, back: () => {}, forward: () => {}, refresh: () => {}, prefetch: () => {} };
const mockPathname = "/admin/test";

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname,
}));

describe("FilterControls responsive classes", () => {
  describe("FilterDateRange", () => {
    it("wrapper uses flex-col sm:flex-row for stacking on mobile", () => {
      const { container } = render(
        <FilterDateRange
          fromKey="dateFrom" toKey="dateTo"
          fromValue="" toValue=""
          fromLabel="From" toLabel="To"
          searchParams={{}}
        />,
      );
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.className).toContain("flex-col");
      expect(wrapper.className).toContain("sm:flex-row");
    });

    it("date inputs use w-full sm:w-[130px]", () => {
      const { container } = render(
        <FilterDateRange
          fromKey="dateFrom" toKey="dateTo"
          fromValue="" toValue=""
          fromLabel="From" toLabel="To"
          searchParams={{}}
        />,
      );
      const inputs = container.querySelectorAll("input[type='date']");
      for (const input of inputs) {
        expect(input.className).toContain("w-full");
        expect(input.className).toContain("sm:w-[130px]");
      }
    });

    it("dash separator is hidden on mobile", () => {
      const { container } = render(
        <FilterDateRange
          fromKey="dateFrom" toKey="dateTo"
          fromValue="" toValue=""
          fromLabel="From" toLabel="To"
          searchParams={{}}
        />,
      );
      const span = container.querySelector("span");
      expect(span!.className).toContain("hidden");
      expect(span!.className).toContain("sm:inline");
    });
  });

  describe("FilterNumberRange", () => {
    it("wrapper uses flex-col sm:flex-row", () => {
      const { container } = render(
        <FilterNumberRange
          minKey="min" maxKey="max"
          minValue="" maxValue=""
          minLabel="Min" maxLabel="Max"
          searchParams={{}}
        />,
      );
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.className).toContain("flex-col");
      expect(wrapper.className).toContain("sm:flex-row");
    });

    it("number inputs use w-full sm:w-[80px]", () => {
      const { container } = render(
        <FilterNumberRange
          minKey="min" maxKey="max"
          minValue="" maxValue=""
          minLabel="Min" maxLabel="Max"
          searchParams={{}}
        />,
      );
      const inputs = container.querySelectorAll("input[type='number']");
      for (const input of inputs) {
        expect(input.className).toContain("w-full");
        expect(input.className).toContain("sm:w-[80px]");
      }
    });
  });

  describe("FilterInput", () => {
    it("uses w-full sm:w-32", () => {
      const { container } = render(
        <FilterInput
          paramKey="q"
          value=""
          placeholder="Search"
          searchParams={{}}
        />,
      );
      const input = container.querySelector("input")!;
      expect(input.className).toContain("w-full");
      expect(input.className).toContain("sm:w-32");
    });
  });
});
