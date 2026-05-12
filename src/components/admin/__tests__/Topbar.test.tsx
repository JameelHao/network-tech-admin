import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Topbar } from "../Topbar";
import { dict } from "@/lib/i18n/dict";

vi.mock("@/lib/i18n/actions", () => ({
  setLang: vi.fn(),
}));

vi.mock("@/app/login/actions", () => ({
  logout: vi.fn(),
}));

const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

Object.defineProperty(window, "matchMedia", {
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const t = dict.en;

describe("Topbar", () => {
  it("renders breadcrumb links and current page", () => {
    render(
      <Topbar
        crumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Insights" },
        ]}
        t={t}
        lang="en"
      />,
    );
    const nav = document.querySelector("nav");
    expect(nav).not.toBeNull();
    const link = nav!.querySelector("a[href='/admin']");
    expect(link).not.toBeNull();
    expect(link!.textContent).toBe("Dashboard");
    expect(nav!.textContent).toContain("Insights");
  });

  it("renders single breadcrumb without separator", () => {
    render(
      <Topbar
        crumbs={[{ label: "Dashboard" }]}
        t={t}
        lang="en"
      />,
    );
    const nav = document.querySelector("nav");
    expect(nav!.textContent).toBe("Dashboard");
    expect(nav!.textContent).not.toContain("/");
  });

  it("renders separator between multiple crumbs", () => {
    render(
      <Topbar
        crumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Insights" },
        ]}
        t={t}
        lang="en"
      />,
    );
    const nav = document.querySelector("nav");
    expect(nav!.textContent).toContain("/");
  });

  it("renders sign out button", () => {
    render(
      <Topbar
        crumbs={[{ label: "Home" }]}
        t={t}
        lang="en"
      />,
    );
    expect(screen.getByText("Sign out")).toBeDefined();
  });

  it("renders language toggle buttons", () => {
    render(
      <Topbar
        crumbs={[{ label: "Home" }]}
        t={t}
        lang="en"
      />,
    );
    expect(screen.getByText("中")).toBeDefined();
    expect(screen.getByText("EN")).toBeDefined();
  });

  it("marks current language as pressed", () => {
    render(
      <Topbar
        crumbs={[{ label: "Home" }]}
        t={t}
        lang="zh"
      />,
    );
    const zhBtn = screen.getByText("中");
    expect(zhBtn.getAttribute("aria-pressed")).toBe("true");
    const enBtn = screen.getByText("EN");
    expect(enBtn.getAttribute("aria-pressed")).toBe("false");
  });
});
