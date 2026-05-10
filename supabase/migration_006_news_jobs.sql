CREATE TABLE news_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  link text NOT NULL UNIQUE,
  snippet text,
  source text,
  pub_date timestamptz,
  category text NOT NULL DEFAULT 'news',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read news_items" ON news_items FOR SELECT USING (true);
CREATE POLICY "allow insert news_items" ON news_items FOR INSERT WITH CHECK (true);
CREATE POLICY "allow delete news_items" ON news_items FOR DELETE USING (true);
