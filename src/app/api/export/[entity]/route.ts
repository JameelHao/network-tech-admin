import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { listConferences } from "@/lib/admin/conferences";
import { listPapers } from "@/lib/admin/papers";
import { listLeads } from "@/lib/admin/leads";
import { listTalentLeads } from "@/lib/admin/talents";
import { listOpenSource } from "@/lib/admin/opensource";
import {
  toCSV,
  toJSON,
  CONFERENCE_FIELDS,
  PAPER_FIELDS,
  LEAD_FIELDS,
  TALENT_FIELDS,
  NEWS_FIELDS,
  OPENSOURCE_FIELDS,
} from "@/lib/admin/export";

export const dynamic = "force-dynamic";

const MAX_EXPORT = 10000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  const { entity } = await params;

  if (entity === "talents") {
    const unauth = await requireAdminAuth();
    if (unauth) return unauth;
  }

  const sp = request.nextUrl.searchParams;
  const format = sp.get("format") === "json" ? "json" : "csv";

  try {
    const { data, filename } = await fetchEntityData(entity, sp);

    const body =
      format === "csv"
        ? toCSV(data, getFields(entity))
        : toJSON(data, getFields(entity));

    const ext = format === "csv" ? "csv" : "json";
    const contentType =
      format === "csv" ? "text/csv; charset=utf-8" : "application/json";
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}_${date}.${ext}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFields(entity: string): any {
  const map: Record<string, unknown> = {
    conferences: CONFERENCE_FIELDS,
    papers: PAPER_FIELDS,
    leads: LEAD_FIELDS,
    talents: TALENT_FIELDS,
    news: NEWS_FIELDS,
    opensource: OPENSOURCE_FIELDS,
  };
  return map[entity];
}

async function fetchEntityData(
  entity: string,
  sp: URLSearchParams,
): Promise<{ data: Record<string, unknown>[]; filename: string }> {
  const bulk = { page: 1, pageSize: MAX_EXPORT };

  switch (entity) {
    case "conferences": {
      const cat = sp.get("cat") || undefined;
      const result = await listConferences(bulk, { category: cat });
      return { data: result.data as unknown as Record<string, unknown>[], filename: "conferences" };
    }
    case "papers": {
      const result = await listPapers(bulk);
      return { data: result.data as unknown as Record<string, unknown>[], filename: "papers" };
    }
    case "leads": {
      const result = await listLeads(bulk);
      return { data: result.data as unknown as Record<string, unknown>[], filename: "leads" };
    }
    case "talents": {
      const stage = sp.get("stage") || undefined;
      const result = await listTalentLeads(bulk, { stage });
      return { data: result.data as unknown as Record<string, unknown>[], filename: "talents" };
    }
    case "news": {
      const supabase = await createClient();
      const { data } = await supabase
        .from("news_items")
        .select("title, source, pub_date, link")
        .eq("category", "news")
        .order("pub_date", { ascending: false })
        .limit(MAX_EXPORT);
      return { data: (data ?? []) as unknown as Record<string, unknown>[], filename: "news" };
    }
    case "opensource": {
      const result = await listOpenSource(bulk);
      return { data: result.data as unknown as Record<string, unknown>[], filename: "opensource" };
    }
    default:
      throw new Error(`Unknown entity: ${entity}`);
  }
}
