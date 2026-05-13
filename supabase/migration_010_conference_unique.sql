-- Add unique constraint on (abbreviation, start_date) for ON CONFLICT support
ALTER TABLE conferences
  ADD CONSTRAINT conferences_abbrev_start_unique UNIQUE (abbreviation, start_date);
