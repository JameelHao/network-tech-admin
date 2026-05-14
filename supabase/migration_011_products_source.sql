-- Add source tracking columns for cloud product ingestion
ALTER TABLE products ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';
ALTER TABLE products ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Unique index on source_url for upsert deduplication (partial: only non-NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_source_url ON products(source_url) WHERE source_url IS NOT NULL;
