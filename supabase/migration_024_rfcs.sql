-- rfcs: IETF RFC tracking for networking-relevant standards
create table if not exists rfcs (
  id uuid primary key default gen_random_uuid(),
  rfc_number integer not null,
  title text not null,
  abstract text,
  url text not null,
  published_at timestamptz,
  topics text[] not null default '{}',
  companies text[] not null default '{}',
  created_at timestamptz not null default now()
);

create unique index if not exists idx_rfcs_number on rfcs(rfc_number);

alter table rfcs enable row level security;

create policy "anon read rfcs" on rfcs for select using (true);
create policy "anon insert rfcs" on rfcs for insert to anon with check (true);
create policy "anon update rfcs" on rfcs for update to anon using (true);
