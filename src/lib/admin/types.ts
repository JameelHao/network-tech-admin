export type InsightType = "conference" | "paper" | "opensource";
export type LeadStage = "new" | "tracking" | "evaluating" | "archived";

export type TopicCategory = "network-systems" | "measurement" | "security" | "emerging" | "infrastructure";
export type ConferenceTier = "top" | "good" | "workshop";

export type Conference = {
  id: string;
  name: string;
  abbreviation: string | null;
  url: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  category: TopicCategory;
  tier: ConferenceTier;
  topics: string[];
  notes: string | null;
  created_at: string;
};

export type ConferenceSession = {
  id: string;
  conference_id: string;
  title: string;
  authors: string[];
  topics: string[];
  affiliations: string[];
  url: string | null;
  abstract: string | null;
  notes: string | null;
  created_at: string;
};

export type Paper = {
  id: string;
  title: string;
  authors: string[];
  venue: string | null;
  url: string | null;
  published_date: string | null;
  abstract: string | null;
  topics: string[];
  notes: string | null;
  created_at: string;
};

export type OpenSource = {
  id: string;
  name: string;
  repo_url: string;
  description: string | null;
  language: string | null;
  stars: number | null;
  last_active: string | null;
  topics: string[];
  notes: string | null;
  created_at: string;
};

export type Lead = {
  id: string;
  title: string;
  stage: LeadStage;
  source_type: InsightType;
  source_id: string;
  source_label?: string;
  summary: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const LEAD_STAGE_COLOR: Record<LeadStage, { dot: string; bg: string; text: string }> = {
  new:        { dot: "bg-blue-500",    bg: "bg-blue-50",    text: "text-blue-700" },
  tracking:   { dot: "bg-amber-500",   bg: "bg-amber-50",   text: "text-amber-700" },
  evaluating: { dot: "bg-violet-500",  bg: "bg-violet-50",  text: "text-violet-700" },
  archived:   { dot: "bg-slate-400",   bg: "bg-slate-100",  text: "text-slate-600" },
};

export const LEAD_STAGES: LeadStage[] = ["new", "tracking", "evaluating", "archived"];

export type TalentLead = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  linkedin_url: string | null;
  source: string | null;
  topics: string[];
  stage: LeadStage;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const SOURCE_TYPE_LABEL: Record<InsightType, string> = {
  conference: "会议",
  paper: "论文",
  opensource: "开源",
};
