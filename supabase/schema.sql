-- conferences
create table conferences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation text,
  url text,
  location text,
  start_date date not null,
  end_date date,
  topics text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

-- papers
create table papers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors text[] not null default '{}',
  venue text,
  url text,
  published_date date,
  abstract text,
  topics text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

-- opensource
create table opensource (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  repo_url text not null,
  description text,
  language text,
  stars integer,
  last_active date,
  topics text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

-- leads
create table leads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  stage text not null default 'new' check (stage in ('new', 'tracking', 'evaluating', 'archived')),
  source_type text not null check (source_type in ('conference', 'paper', 'opensource')),
  source_id uuid not null,
  source_label text,
  summary text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table conferences enable row level security;
alter table papers enable row level security;
alter table opensource enable row level security;
alter table leads enable row level security;

-- anon read access
create policy "anon read conferences" on conferences for select using (true);
create policy "anon read papers" on papers for select using (true);
create policy "anon read opensource" on opensource for select using (true);
create policy "anon read leads" on leads for select using (true);
