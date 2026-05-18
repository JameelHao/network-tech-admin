import { createClient } from "@/lib/supabase/server";
import { TOPICS, type TopicDef } from "./topics";

export async function listTopicDefinitions(): Promise<TopicDef[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_topics")
    .select("slug, category, en, zh")
    .order("category", { ascending: true })
    .order("slug", { ascending: true });

  if (error) {
    return TOPICS;
  }

  return (data ?? []) as TopicDef[];
}
