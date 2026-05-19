"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Return paper IDs matching ALL of the given topic slugs (AND logic).
 * A paper must have every selected topic to be included.
 */
export async function getPaperIdsByTopics(topics: string[]): Promise<string[]> {
  if (topics.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("paper_topics")
    .select("paper_id")
    .in("topic_slug", topics);
  // Count how many of the requested topics each paper has.
  // Only keep papers whose count matches the number of requested topics (AND).
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.paper_id, (counts.get(row.paper_id) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([_, count]) => count === topics.length)
    .map(([id]) => id);
}
