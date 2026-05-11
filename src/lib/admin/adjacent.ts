import { createClient } from "@/lib/supabase/server";

export type AdjacentItem = { id: string; label: string } | null;
export type AdjacentResult = { prev: AdjacentItem; next: AdjacentItem };

export async function getAdjacentItems(
  table: string,
  id: string,
  labelColumn: string,
  sortColumn: string,
  ascending: boolean,
): Promise<AdjacentResult> {
  const supabase = await createClient();

  const { data: current } = await supabase
    .from(table)
    .select(`${sortColumn}`)
    .eq("id", id)
    .single();

  if (!current) return { prev: null, next: null };

  const val = current[sortColumn];

  const prevQuery = supabase
    .from(table)
    .select(`id, ${labelColumn}`)
    .order(sortColumn, { ascending: !ascending })
    .limit(1);

  const nextQuery = supabase
    .from(table)
    .select(`id, ${labelColumn}`)
    .order(sortColumn, { ascending })
    .limit(1);

  if (ascending) {
    prevQuery.lt(sortColumn, val);
    nextQuery.gt(sortColumn, val);
  } else {
    prevQuery.gt(sortColumn, val);
    nextQuery.lt(sortColumn, val);
  }

  const [{ data: prevData }, { data: nextData }] = await Promise.all([
    prevQuery,
    nextQuery,
  ]);

  const toItem = (rows: typeof prevData): AdjacentItem =>
    rows?.[0] ? { id: rows[0].id, label: rows[0][labelColumn] ?? rows[0].id } : null;

  return { prev: toItem(prevData), next: toItem(nextData) };
}
