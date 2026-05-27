-- Clean up duplicate papers (same normalized title, multiple rows)
-- Keep oldest (by created_at), merge paper_topics, delete rest

-- Step 1: merge paper_topics from duplicates into kept paper
WITH dup_groups AS (
  SELECT
    (array_agg(id ORDER BY created_at, id))[1] AS keep_id,
    array_agg(id ORDER BY created_at, id) AS all_ids
  FROM (
    SELECT id, created_at,
      lower(regexp_replace(trim(title), '\s+', ' ', 'g')) AS norm_title
    FROM papers
  ) t
  GROUP BY norm_title
  HAVING count(*) > 1
)
INSERT INTO paper_topics (paper_id, topic_slug)
SELECT d.keep_id, x.topic_slug
FROM dup_groups d
CROSS JOIN LATERAL (
  SELECT DISTINCT pt.topic_slug
  FROM paper_topics pt
  WHERE pt.paper_id = ANY(d.all_ids)
    AND pt.paper_id != d.keep_id
) x
ON CONFLICT DO NOTHING;

-- Step 2: delete duplicate papers (keep_id stays, rest removed)
WITH dup_groups AS (
  SELECT
    (array_agg(id ORDER BY created_at, id))[1] AS keep_id,
    array_agg(id ORDER BY created_at, id) AS all_ids
  FROM (
    SELECT id, created_at,
      lower(regexp_replace(trim(title), '\s+', ' ', 'g')) AS norm_title
    FROM papers
  ) t
  GROUP BY norm_title
  HAVING count(*) > 1
)
DELETE FROM papers
WHERE id IN (
  SELECT unnest(all_ids[2:cardinality(all_ids)]) FROM dup_groups
);

-- Verify
SELECT count(*) AS remaining_duplicates FROM (
  SELECT lower(regexp_replace(trim(title), '\s+', ' ', 'g'))
  FROM papers
  GROUP BY 1
  HAVING count(*) > 1
) t;
