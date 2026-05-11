import { describe, it, expect } from "vitest";
import {
  mapConferences,
  mapPapers,
  mapLeads,
  mapTalents,
  mapNews,
  mapOpenSource,
  filterItems,
  groupByType,
  type SearchableItem,
} from "../command-search";
import type { Conference, Paper, Lead, TalentLead, OpenSource } from "../types";
import type { NewsItemLight } from "../news-items";

describe("mapConferences", () => {
  it("maps conference with abbreviation", () => {
    const conf = {
      id: "1",
      name: "ACM SIGCOMM",
      abbreviation: "SIGCOMM",
      url: null,
      location: "Boston",
      start_date: "2026-08-10",
      end_date: null,
      category: "network-systems" as const,
      tier: "top" as const,
      topics: [],
      notes: null,
      created_at: "2026-01-01",
    };
    const result = mapConferences([conf]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("SIGCOMM — ACM SIGCOMM");
    expect(result[0].subtitle).toBe("Boston · 2026-08-10");
    expect(result[0].href).toBe("/admin/conferences/1");
    expect(result[0].type).toBe("conference");
  });

  it("maps conference without abbreviation", () => {
    const conf = {
      id: "2",
      name: "Some Workshop",
      abbreviation: null,
      url: null,
      location: null,
      start_date: "2026-06-01",
      end_date: null,
      category: "emerging" as const,
      tier: "workshop" as const,
      topics: [],
      notes: null,
      created_at: "2026-01-01",
    };
    const result = mapConferences([conf]);
    expect(result[0].title).toBe("Some Workshop");
    expect(result[0].subtitle).toBe("2026-06-01");
  });

  it("returns empty for empty input", () => {
    expect(mapConferences([])).toEqual([]);
  });
});

describe("mapPapers", () => {
  it("maps paper with truncated authors", () => {
    const paper: Paper = {
      id: "p1",
      title: "Attention Is All You Need",
      authors: ["Vaswani", "Shazeer", "Parmar", "Uszkoreit"],
      venue: null,
      url: null,
      published_date: null,
      abstract: null,
      topics: [],
      notes: null,
      created_at: "2026-01-01",
    };
    const result = mapPapers([paper]);
    expect(result[0].subtitle).toBe("Vaswani, Shazeer, Parmar …");
    expect(result[0].href).toBe("/admin/papers/p1");
  });

  it("maps paper with 3 or fewer authors without ellipsis", () => {
    const paper: Paper = {
      id: "p2",
      title: "Test",
      authors: ["A", "B"],
      venue: null,
      url: null,
      published_date: null,
      abstract: null,
      topics: [],
      notes: null,
      created_at: "2026-01-01",
    };
    const result = mapPapers([paper]);
    expect(result[0].subtitle).toBe("A, B");
  });
});

describe("mapLeads", () => {
  it("maps lead with source_label and stage", () => {
    const lead: Lead = {
      id: "l1",
      title: "Edge Computing Trend",
      stage: "tracking",
      source_type: "conference",
      source_id: "s1",
      source_label: "from NSDI",
      summary: null,
      notes: null,
      created_at: "2026-01-01",
      updated_at: "2026-01-02",
    };
    const result = mapLeads([lead]);
    expect(result[0].subtitle).toBe("from NSDI · tracking");
    expect(result[0].href).toBe("/admin/leads/l1");
  });

  it("handles missing source_label", () => {
    const lead: Lead = {
      id: "l2",
      title: "Test",
      stage: "new",
      source_type: "paper",
      source_id: "s2",
      summary: null,
      notes: null,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    };
    const result = mapLeads([lead]);
    expect(result[0].subtitle).toBe("new");
  });
});

describe("mapTalents", () => {
  it("maps talent with company and role", () => {
    const talent: TalentLead = {
      id: "t1",
      name: "John Smith",
      role: "SRE",
      company: "Google",
      linkedin_url: null,
      source: null,
      topics: [],
      stage: "new",
      notes: null,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    };
    const result = mapTalents([talent]);
    expect(result[0].title).toBe("John Smith");
    expect(result[0].subtitle).toBe("Google · SRE");
  });

  it("handles missing company and role", () => {
    const talent: TalentLead = {
      id: "t2",
      name: "Jane",
      role: null,
      company: null,
      linkedin_url: null,
      source: null,
      topics: [],
      stage: "new",
      notes: null,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    };
    const result = mapTalents([talent]);
    expect(result[0].subtitle).toBe("");
  });
});

describe("mapNews", () => {
  it("maps news with external flag", () => {
    const news: NewsItemLight = {
      id: "n1",
      title: "Cloudflare launches new feature",
      link: "https://blog.cloudflare.com/new",
      source: "Cloudflare Blog",
    };
    const result = mapNews([news]);
    expect(result[0].external).toBe(true);
    expect(result[0].href).toBe("https://blog.cloudflare.com/new");
    expect(result[0].subtitle).toBe("Cloudflare Blog");
  });

  it("handles null source", () => {
    const news: NewsItemLight = {
      id: "n2",
      title: "Test",
      link: "https://example.com",
      source: null,
    };
    const result = mapNews([news]);
    expect(result[0].subtitle).toBe("");
  });
});

describe("mapOpenSource", () => {
  it("maps opensource with description and stars", () => {
    const os: OpenSource = {
      id: "o1",
      name: "Cilium",
      repo_url: "https://github.com/cilium/cilium",
      description: "eBPF-based networking, observability, and security for Kubernetes",
      language: "Go",
      stars: 18000,
      last_active: "2026-05-01",
      topics: [],
      notes: null,
      created_at: "2026-01-01",
    };
    const result = mapOpenSource([os]);
    expect(result[0].title).toBe("Cilium");
    expect(result[0].subtitle).toContain("eBPF-based");
    expect(result[0].subtitle).toContain("★18000");
    expect(result[0].href).toBe("/admin/opensource/o1");
  });

  it("handles null description and stars", () => {
    const os: OpenSource = {
      id: "o2",
      name: "Test",
      repo_url: "https://github.com/test",
      description: null,
      language: null,
      stars: null,
      last_active: null,
      topics: [],
      notes: null,
      created_at: "2026-01-01",
    };
    const result = mapOpenSource([os]);
    expect(result[0].subtitle).toBe("");
  });
});

describe("filterItems", () => {
  const items: SearchableItem[] = [
    { id: "1", type: "conference", title: "ACM SIGCOMM", subtitle: "Boston", href: "/a" },
    { id: "2", type: "paper", title: "Network Function Virtualization", subtitle: "Smith, Jones", href: "/b" },
    { id: "3", type: "talent", title: "Jane Doe", subtitle: "Google · SRE", href: "/c" },
  ];

  it("filters by title match", () => {
    const result = filterItems(items, "sigcomm");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by subtitle match", () => {
    const result = filterItems(items, "google");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("is case insensitive", () => {
    const result = filterItems(items, "NETWORK");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("returns empty for empty query", () => {
    expect(filterItems(items, "")).toEqual([]);
    expect(filterItems(items, "   ")).toEqual([]);
  });

  it("returns empty for no match", () => {
    expect(filterItems(items, "zzzzz")).toEqual([]);
  });

  it("matches across title and subtitle", () => {
    const result = filterItems(items, "smith");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });
});

describe("groupByType", () => {
  const items: SearchableItem[] = [
    { id: "1", type: "conference", title: "A", subtitle: "", href: "/a" },
    { id: "2", type: "conference", title: "B", subtitle: "", href: "/b" },
    { id: "3", type: "paper", title: "C", subtitle: "", href: "/c" },
    { id: "4", type: "talent", title: "D", subtitle: "", href: "/d" },
  ];

  it("groups items by entity type", () => {
    const grouped = groupByType(items);
    expect(grouped.get("conference")).toHaveLength(2);
    expect(grouped.get("paper")).toHaveLength(1);
    expect(grouped.get("talent")).toHaveLength(1);
  });

  it("returns empty map for empty input", () => {
    const grouped = groupByType([]);
    expect(grouped.size).toBe(0);
  });

  it("does not include types with no items", () => {
    const grouped = groupByType(items);
    expect(grouped.has("news")).toBe(false);
    expect(grouped.has("lead")).toBe(false);
  });
});
