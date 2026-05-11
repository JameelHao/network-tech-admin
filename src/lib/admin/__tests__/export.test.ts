import { describe, it, expect } from "vitest";
import { toCSV, toJSON, type FieldDef } from "../export";

type Row = {
  name: string;
  tags: string[];
  date: string;
  score: number;
  note: string | null;
};

const fields: FieldDef<Row>[] = [
  { key: "name", label: "Name" },
  { key: "tags", label: "Tags", transform: (v) => (Array.isArray(v) ? v.join("; ") : String(v)) },
  { key: "date", label: "Date", transform: (v) => String(v ?? "").slice(0, 10) },
  { key: "score", label: "Score" },
  { key: "note", label: "Note", transform: (v) => String(v ?? "") },
];

const rows: Row[] = [
  { name: "Alpha", tags: ["a", "b"], date: "2026-01-15T00:00:00Z", score: 10, note: null },
  { name: "Beta, Inc.", tags: ["c"], date: "2026-03-20", score: 5, note: 'He said "hello"' },
  { name: "Gamma\nNew", tags: [], date: "", score: 0, note: "" },
];

describe("toCSV", () => {
  it("starts with UTF-8 BOM", () => {
    const csv = toCSV(rows, fields);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("produces correct header", () => {
    const csv = toCSV(rows, fields);
    const header = csv.split("\n")[0].replace("﻿", "");
    expect(header).toBe("Name,Tags,Date,Score,Note");
  });

  it("escapes commas with quotes", () => {
    const csv = toCSV(rows, fields);
    const line2 = csv.split("\n")[2];
    expect(line2).toContain('"Beta, Inc."');
  });

  it("escapes double quotes by doubling", () => {
    const csv = toCSV(rows, fields);
    const line2 = csv.split("\n")[2];
    expect(line2).toContain('"He said ""hello"""');
  });

  it("escapes newlines in values", () => {
    const csv = toCSV(rows, fields);
    expect(csv).toContain('"Gamma\nNew"');
  });

  it("joins array fields with semicolons", () => {
    const csv = toCSV(rows, fields);
    const line1 = csv.split("\n")[1];
    expect(line1).toContain("a; b");
  });

  it("handles null values", () => {
    const csv = toCSV(rows, fields);
    const line1 = csv.split("\n")[1];
    expect(line1.endsWith(",")).toBe(true);
  });

  it("handles empty data", () => {
    const csv = toCSV([], fields);
    const lines = csv.replace("﻿", "").split("\n");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe("Name,Tags,Date,Score,Note");
  });
});

describe("toJSON", () => {
  it("returns valid JSON", () => {
    const json = toJSON(rows, fields);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("is formatted with 2-space indent", () => {
    const json = toJSON(rows, fields);
    expect(json).toContain("  ");
    expect(json.startsWith("[")).toBe(true);
  });

  it("only includes specified fields", () => {
    const json = toJSON(rows, fields);
    const parsed = JSON.parse(json);
    const keys = Object.keys(parsed[0]);
    expect(keys).toEqual(["name", "tags", "date", "score", "note"]);
  });

  it("applies transforms", () => {
    const json = toJSON(rows, fields);
    const parsed = JSON.parse(json);
    expect(parsed[0].tags).toBe("a; b");
    expect(parsed[0].date).toBe("2026-01-15");
    expect(parsed[0].note).toBe("");
  });

  it("handles empty data", () => {
    const json = toJSON([], fields);
    expect(JSON.parse(json)).toEqual([]);
  });
});
