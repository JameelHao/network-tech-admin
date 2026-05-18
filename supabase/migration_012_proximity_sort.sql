-- Add proximity-sorted conference query for "closest to today first" ordering
-- Sort logic: ongoing (today within range) → upcoming (soonest first) → past (most recent first)

CREATE OR REPLACE FUNCTION get_conferences_by_proximity(
  p_cat TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_date_from TEXT DEFAULT NULL,
  p_date_to TEXT DEFAULT NULL,
  p_page_size INT DEFAULT 50,
  p_page_num INT DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result_data JSON;
  total_count BIGINT;
  offset_val INT;
BEGIN
  offset_val := (p_page_num - 1) * p_page_size;

  -- Count matching rows
  SELECT COUNT(*) INTO total_count
  FROM conferences c
  WHERE (p_cat IS NULL OR p_cat = 'all' OR c.category = p_cat)
    AND (p_date_from IS NULL OR c.start_date >= p_date_from::DATE)
    AND (p_date_to IS NULL OR c.start_date <= p_date_to::DATE)
    AND (p_status IS NULL
      OR (p_status = 'upcoming' AND COALESCE(c.end_date, c.start_date) >= CURRENT_DATE)
      OR (p_status = 'past' AND COALESCE(c.end_date, c.start_date) < CURRENT_DATE));

  -- Fetch paginated results with proximity ordering
  WITH sorted AS (
    SELECT
      c.id, c.name, c.abbreviation, c.url, c.location,
      c.start_date, c.end_date, c.category, c.tier,
      c.topics, c.notes, c.created_at,
      CASE
        WHEN c.start_date <= CURRENT_DATE AND COALESCE(c.end_date, c.start_date) >= CURRENT_DATE THEN 0
        WHEN c.start_date > CURRENT_DATE THEN 1
        ELSE 2
      END AS prox_group
    FROM conferences c
    WHERE (p_cat IS NULL OR p_cat = 'all' OR c.category = p_cat)
      AND (p_date_from IS NULL OR c.start_date >= p_date_from::DATE)
      AND (p_date_to IS NULL OR c.start_date <= p_date_to::DATE)
      AND (p_status IS NULL
        OR (p_status = 'upcoming' AND COALESCE(c.end_date, c.start_date) >= CURRENT_DATE)
        OR (p_status = 'past' AND COALESCE(c.end_date, c.start_date) < CURRENT_DATE))
  )
  SELECT json_agg(row_to_json(s)) INTO result_data
  FROM (
    SELECT id, name, abbreviation, url, location, start_date, end_date,
           category, tier, topics, notes, created_at
    FROM sorted
    ORDER BY
      prox_group,
      CASE WHEN start_date > CURRENT_DATE THEN start_date END ASC NULLS LAST,
      CASE WHEN COALESCE(end_date, start_date) < CURRENT_DATE THEN COALESCE(end_date, start_date) END DESC NULLS LAST
    LIMIT p_page_size OFFSET offset_val
  ) s;

  RETURN json_build_object(
    'data', COALESCE(result_data, '[]'::json),
    'total', total_count
  );
END;
$$;
