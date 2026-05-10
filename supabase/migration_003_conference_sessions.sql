CREATE TABLE conference_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id uuid NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
  title text NOT NULL,
  authors text[] NOT NULL DEFAULT '{}',
  topics text[] NOT NULL DEFAULT '{}',
  url text,
  abstract text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conference_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read conference_sessions" ON conference_sessions FOR SELECT USING (true);
CREATE POLICY "allow insert conference_sessions" ON conference_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "allow delete conference_sessions" ON conference_sessions FOR DELETE USING (true);
CREATE POLICY "allow update conference_sessions" ON conference_sessions FOR UPDATE USING (true);
