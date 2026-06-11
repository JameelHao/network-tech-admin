create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'vendor',
  website text,
  description text,
  hq_location text,
  founded_year integer,
  employee_range text,
  key_products text[] not null default '{}',
  topics text[] not null default '{}',
  stage text not null default 'watching',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vendors_type on vendors(type);
create index if not exists idx_vendors_stage on vendors(stage);

alter table vendors enable row level security;
create policy "anon read vendors" on vendors for select to anon using (true);
create policy "auth read vendors" on vendors for select to authenticated using (true);
create policy "anon insert vendors" on vendors for insert to anon with check (true);
create policy "anon update vendors" on vendors for update to anon using (true);
