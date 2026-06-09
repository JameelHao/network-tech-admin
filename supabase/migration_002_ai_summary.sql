ALTER TABLE papers ADD COLUMN IF NOT EXISTS ai_summary text;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS similar_papers uuid[] DEFAULT '{}';
ALTER TABLE papers ADD COLUMN IF NOT EXISTS relevance_score integer;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS relevance_score integer DEFAULT 0;
