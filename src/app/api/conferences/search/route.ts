import { NextResponse } from "next/server";
import { searchWeb, extractDates, extractLocation } from "@/lib/admin/search";

export async function POST(request: Request) {
  const { query } = await request.json();

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  try {
    const results = await searchWeb(`${query} conference 2025 2026 dates location`);
    const allText = results.map((r) => r.snippet).join(" ");

    const dates = extractDates(allText);
    const location = extractLocation(allText);

    return NextResponse.json({
      suggestion: {
        name: results[0]?.title?.replace(/ - .*$/, "").trim() ?? query,
        url: results[0]?.link ?? "",
        location: location ?? "",
        ...dates,
      },
      sources: results.slice(0, 5),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
