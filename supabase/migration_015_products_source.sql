-- Add missing source column to products table
-- Used by sync-status API to separate cloud-products from regular products

alter table products add column source text default 'manual' not null;

-- Mark existing manually-added products
update products set source = 'manual' where source is null or source = '';
