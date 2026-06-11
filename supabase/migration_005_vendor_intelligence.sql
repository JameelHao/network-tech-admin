ALTER TABLE vendors ADD COLUMN IF NOT EXISTS ai_insights jsonb DEFAULT '{}';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS paper_count integer DEFAULT 0;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS product_count integer DEFAULT 0;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS news_count integer DEFAULT 0;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS last_activity_date text;

-- Allow upsert by name
ALTER TABLE vendors ADD CONSTRAINT vendors_name_unique UNIQUE (name);
