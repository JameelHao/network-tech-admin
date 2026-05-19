import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { fetchAndStorePatents, importPatents, getStoredPatentCount, getCompanyPatentUrl } from "@/lib/admin/patents";
import { COMPANY_NAMES } from "@/lib/admin/companies";

export const dynamic = "force-dynamic";

const COMPANY_SLUGS = Object.keys(COMPANY_NAMES);

export async function POST(request: Request) {
  const unauth = await requireAdminAuth();
  if (unauth) return unauth;

  const body = await request.json();
  const { company, numbers } = body;

  if (!company) {
    return NextResponse.json({ error: "Missing company" }, { status: 400 });
  }

  if (!COMPANY_SLUGS.includes(company)) {
    return NextResponse.json({ error: `Invalid company: ${company}` }, { status: 400 });
  }

  // If numbers provided → manual import; otherwise → automated fetch
  if (numbers && Array.isArray(numbers)) {
    const result = await importPatents(company, numbers);
    return NextResponse.json({ company, ...result });
  }

  const result = await fetchAndStorePatents(company);
  return NextResponse.json({ company, ...result });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("company");

  if (slug) {
    const searchUrl = getCompanyPatentUrl(slug);
    const count = await getStoredPatentCount(slug);
    return NextResponse.json({ company: slug, count, searchUrl });
  }

  const counts: Record<string, number> = {};
  for (const s of COMPANY_SLUGS) {
    counts[s] = await getStoredPatentCount(s);
  }
  return NextResponse.json({
    total: Object.values(counts).reduce((a, c) => a + c, 0),
    companies: counts,
    searchUrls: Object.fromEntries(COMPANY_SLUGS.map((s) => [s, getCompanyPatentUrl(s)])),
  });
}
