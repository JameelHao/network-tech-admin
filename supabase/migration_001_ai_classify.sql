-- Add AI classification fields to papers and news_items
ALTER TABLE papers ADD COLUMN IF NOT EXISTS ai_classified boolean DEFAULT false;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS ai_classified boolean DEFAULT false;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS ai_topics text[] DEFAULT '{}';
