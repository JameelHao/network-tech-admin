import { createClient } from "@/lib/supabase/server";

export type NewsItemLight = {
  id: string;
  title: string;
  link: string;
  source: string | null;
};

export async function listNewsLight(limit = 200): Promise<NewsItemLight[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_items")
    .select("id, title, link, source")
    .eq("category", "news")
    .order("pub_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as NewsItemLight[]) ?? [];
}
