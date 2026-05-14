import { NextResponse } from "next/server";
import { ARXIV_CATEGORIES, S2_VENUES } from "@/lib/admin/paper-import";

export const dynamic = "force-dynamic";

export type SyncStep = {
  source: "arxiv" | "s2";
  key: string;
  label: string;
};

export function GET() {
  const steps: SyncStep[] = [
    ...ARXIV_CATEGORIES.map((cat) => ({
      source: "arxiv" as const,
      key: cat,
      label: `arXiv ${cat}`,
    })),
    ...S2_VENUES.map((venue) => ({
      source: "s2" as const,
      key: venue,
      label: `S2 ${venue}`,
    })),
  ];
  return NextResponse.json({ steps });
}
