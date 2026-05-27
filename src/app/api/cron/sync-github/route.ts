import { NextResponse } from "next/server";
import { syncCompanyRepos } from "@/lib/admin/github";
import { COMPANY_NAMES } from "@/lib/admin/companies";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slugs = Object.keys(COMPANY_NAMES);
  const results: Record<string, { inserted: number; total: number; error?: string }> = {};

  for (const slug of slugs) {
    results[slug] = await syncCompanyRepos(slug);
  }

  const totalInserted = Object.values(results).reduce((s, r) => s + r.inserted, 0);
  const totalRepos = Object.values(results).reduce((s, r) => s + r.total, 0);
  const errors = Object.entries(results).filter(([, r]) => r.error).map(([s]) => s);

  return NextResponse.json({
    success: errors.length === 0,
    companies: slugs.length,
    totalInserted,
    totalRepos,
    errors: errors.length > 0 ? errors : undefined,
    results,
  });
}
