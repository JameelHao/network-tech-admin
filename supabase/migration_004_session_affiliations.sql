ALTER TABLE conference_sessions ADD COLUMN affiliations text[] NOT NULL DEFAULT '{}';
