import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionStats } from "../SessionStats";
import type { ConferenceSession } from "@/lib/admin/types";

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

const labels = {
  topAuthors: "Top Authors",
  topAffiliations: "Top Affiliations",
  topicDistribution: "Topic Distribution",
  papers: "Papers",
};

function makeSessions(count: number): ConferenceSession[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `s${i}`,
    conference_id: "c1",
    title: `Paper ${i}`,
    authors: [`Author ${i % 3}`],
    affiliations: [`Univ ${i % 2}`],
    topics: ["routing"],
    abstract: null,
    url: null,
  }));
}

describe("SessionStats", () => {
  it("returns null when sessions is empty", () => {
    const { container } = render(
      <SessionStats sessions={[]} labels={labels} lang="en" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders section heading", () => {
    const sessions = makeSessions(5);
    render(<SessionStats sessions={sessions} labels={labels} lang="en" />);
    const headings = screen.getAllByText("Topic Distribution");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders Top Authors label", () => {
    const sessions = makeSessions(5);
    render(<SessionStats sessions={sessions} labels={labels} lang="en" />);
    expect(screen.getByText("Top Authors")).toBeDefined();
  });

  it("renders Top Affiliations label", () => {
    const sessions = makeSessions(5);
    render(<SessionStats sessions={sessions} labels={labels} lang="en" />);
    expect(screen.getByText("Top Affiliations")).toBeDefined();
  });

  it("renders MiniBar and MiniPie via ResponsiveContainer", () => {
    const sessions = makeSessions(10);
    const { container } = render(
      <SessionStats sessions={sessions} labels={labels} lang="en" />,
    );
    const containers = container.querySelectorAll("[data-testid='responsive-container']");
    expect(containers.length).toBe(3);
  });

  it("renders 3-column grid layout", () => {
    const sessions = makeSessions(5);
    const { container } = render(
      <SessionStats sessions={sessions} labels={labels} lang="en" />,
    );
    const grid = container.querySelector(".lg\\:grid-cols-3");
    expect(grid).not.toBeNull();
  });

  it("is a client component (has use client directive)", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      "src/components/admin/SessionStats.tsx",
      "utf-8",
    );
    expect(content.startsWith('"use client"')).toBe(true);
  });
});
