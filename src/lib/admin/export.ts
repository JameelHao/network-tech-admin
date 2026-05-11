export type FieldDef<T> = {
  key: keyof T;
  label: string;
  transform?: (value: unknown) => string;
};

const arrayJoin = (v: unknown) => (Array.isArray(v) ? v.join("; ") : String(v ?? ""));
const dateSlice = (v: unknown) => (typeof v === "string" ? v.slice(0, 10) : "");
const str = (v: unknown) => String(v ?? "");

export const CONFERENCE_FIELDS = [
  { key: "name", label: "Name" },
  { key: "abbreviation", label: "Abbreviation", transform: str },
  { key: "location", label: "Location", transform: str },
  { key: "start_date", label: "Start Date", transform: dateSlice },
  { key: "end_date", label: "End Date", transform: dateSlice },
  { key: "category", label: "Category" },
  { key: "tier", label: "Tier" },
  { key: "topics", label: "Topics", transform: arrayJoin },
] as const;

export const PAPER_FIELDS = [
  { key: "title", label: "Title" },
  { key: "authors", label: "Authors", transform: arrayJoin },
  { key: "venue", label: "Venue", transform: str },
  { key: "published_date", label: "Published Date", transform: dateSlice },
  { key: "topics", label: "Topics", transform: arrayJoin },
  { key: "url", label: "URL", transform: str },
] as const;

export const LEAD_FIELDS = [
  { key: "title", label: "Title" },
  { key: "stage", label: "Stage" },
  { key: "source_type", label: "Source Type" },
  { key: "source_label", label: "Source", transform: str },
  { key: "summary", label: "Summary", transform: str },
] as const;

export const TALENT_FIELDS = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role", transform: str },
  { key: "company", label: "Company", transform: str },
  { key: "linkedin_url", label: "LinkedIn", transform: str },
  { key: "topics", label: "Topics", transform: arrayJoin },
  { key: "stage", label: "Stage" },
] as const;

export const NEWS_FIELDS = [
  { key: "title", label: "Title" },
  { key: "source", label: "Source", transform: str },
  { key: "pub_date", label: "Date", transform: dateSlice },
  { key: "link", label: "Link", transform: str },
] as const;

export const OPENSOURCE_FIELDS = [
  { key: "name", label: "Name" },
  { key: "repo_url", label: "Repository" },
  { key: "language", label: "Language", transform: str },
  { key: "stars", label: "Stars", transform: (v: unknown) => String(v ?? 0) },
  { key: "last_active", label: "Last Active", transform: dateSlice },
  { key: "topics", label: "Topics", transform: arrayJoin },
] as const;

function escapeCSV(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCSV<T extends Record<string, unknown>>(
  rows: T[],
  fields: readonly FieldDef<T>[],
): string {
  const BOM = "﻿";
  const header = fields.map((f) => escapeCSV(f.label)).join(",");
  const lines = rows.map((row) =>
    fields
      .map((f) => {
        const raw = row[f.key];
        const value = f.transform ? f.transform(raw) : String(raw ?? "");
        return escapeCSV(value);
      })
      .join(","),
  );
  return BOM + [header, ...lines].join("\n");
}

export function toJSON<T extends Record<string, unknown>>(
  rows: T[],
  fields: readonly FieldDef<T>[],
): string {
  const filtered = rows.map((row) => {
    const obj: Record<string, unknown> = {};
    for (const f of fields) {
      obj[f.key as string] = f.transform ? f.transform(row[f.key]) : row[f.key];
    }
    return obj;
  });
  return JSON.stringify(filtered, null, 2);
}
