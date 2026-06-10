-- Populate vendors table from unique vendor names in products
INSERT INTO vendors (name, type, stage)
SELECT DISTINCT trim(v.vendor) as name, 'vendor' as type, 'active' as stage
FROM products v
WHERE v.vendor IS NOT NULL
  AND trim(v.vendor) != ''
  AND NOT EXISTS (SELECT 1 FROM vendors vt WHERE lower(vt.name) = lower(trim(v.vendor)));

-- Set topics from products
UPDATE vendors v
SET topics = (
  SELECT array_agg(DISTINCT un.topic)
  FROM (
    SELECT unnest(p.topics) as topic
    FROM products p
    WHERE lower(p.vendor) = lower(v.name)
  ) un
  WHERE un.topic IS NOT NULL
)
WHERE EXISTS (SELECT 1 FROM products p WHERE lower(p.vendor) = lower(v.name));
