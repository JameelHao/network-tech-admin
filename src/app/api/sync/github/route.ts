import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { syncCompanyRepos, getStoredRepoCount } from "@/lib/admin/github";
import { COMPANY_NAMES } from "@/lib/admin/companies";

export const dynamic = "force-dynamic";

const COMPANY_SLUGS = Object.keys(COMPANY_NAMES);

export async function POST(request: Request) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const body = await request.json();
  const { company, all } = body;

  // Sync all companies
  if (all) {
    const results: Record<string, { inserted: number; total: number; error?: string }> = {};
    for (const s of COMPANY_SLUGS) {
      results[s] = await syncCompanyRepos(s);
    }
    return NextResponse.json({ all: true, results });
  }

  if (!company) {
    return NextResponse.json({ error: "Missing company" }, { status: 400 });
  }

  if (!COMPANY_SLUGS.includes(company)) {
    return NextResponse.json({ error: `Invalid company: ${company}` }, { status: 400 });
  }

  const result = await syncCompanyRepos(company);
  return NextResponse.json({ company, ...result });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("company");

  if (slug) {
    const count = await getStoredRepoCount(slug);
    return NextResponse.json({ company: slug, count });
  }

  const counts: Record<string, number> = {};
  for (const s of COMPANY_SLUGS) {
    counts[s] = await getStoredRepoCount(s);
  }
  return NextResponse.json({
    total: Object.values(counts).reduce((a, c) => a + c, 0),
    companies: counts,
  });
}
