CREATE TABLE talent_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  company text,
  linkedin_url text,
  source text,
  topics text[] NOT NULL DEFAULT '{}',
  stage text NOT NULL DEFAULT 'new',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE talent_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read talent_leads" ON talent_leads FOR SELECT USING (true);
CREATE POLICY "allow insert talent_leads" ON talent_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "allow update talent_leads" ON talent_leads FOR UPDATE USING (true);
CREATE POLICY "allow delete talent_leads" ON talent_leads FOR DELETE USING (true);
