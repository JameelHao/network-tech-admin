-- Add category and tier columns to conferences
ALTER TABLE conferences
  ADD COLUMN category text NOT NULL DEFAULT 'network-systems'
    CHECK (category IN ('network-systems', 'measurement', 'security', 'emerging', 'infrastructure')),
  ADD COLUMN tier text NOT NULL DEFAULT 'good'
    CHECK (tier IN ('top', 'good', 'workshop'));
