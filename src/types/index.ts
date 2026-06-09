export type Paper = {
  id: string;
  title: string;
  authors: string[];
  venue: string | null;
  url: string | null;
  published_date: string | null;
  abstract: string | null;
  topics: string[];
  companies: string[];
  citation_count: number | null;
  source: string | null;
  created_at: string;
};

export type NewsItem = {
  id: string;
  title: string;
  link: string;
  snippet: string | null;
  source: string | null;
  category: string;
  pub_date: string | null;
  companies: string[];
  created_at: string;
};

export type RSSItem = {
  title: string;
  link: string;
  snippet: string;
  source: string;
  pubDate: string | null;
  companies: string[];
};

export type FeedStat = {
  source: string;
  status: "ok" | "error";
  count: number;
  error?: string;
};

export type Product = {
  id: string;
  name: string;
  vendor: string | null;
  category: string;
  description: string | null;
  url: string | null;
  topics: string[];
  stage: string;
  pricing: string | null;
  latest_version: string | null;
  release_date: string | null;
  created_at: string;
  updated_at: string;
};

export type GitHubRepo = {
  id: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  pushed_at: string | null;
  company_slug: string;
  gh_created_at: string | null;
  created_at: string;
};

export type ImportedPaper = {
  title: string;
  authors: string[];
  venue: string | null;
  url: string | null;
  published_date: string | null;
  abstract: string | null;
  topics: string[];
  companies: string[];
  citation_count?: number | null;
  source?: string;
};

export type CategoryStat = {
  category: string;
  status: "ok" | "error";
  count: number;
  error?: string;
};
