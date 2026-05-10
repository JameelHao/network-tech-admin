import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const abbr = searchParams.get("abbr");
  const year = searchParams.get("year");

  if (!abbr) {
    return NextResponse.json({ error: "abbr required" }, { status: 400 });
  }

  const supabase = await createClient();
  let query = supabase.from("conferences").select("id, abbreviation, start_date").eq("abbreviation", abbr);

  if (year) {
    query = query.gte("start_date", `${year}-01-01`).lte("start_date", `${year}-12-31`);
  }

  const { data, error } = await query.single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}
