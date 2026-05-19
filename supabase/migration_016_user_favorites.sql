-- User favorites table — replaces localStorage-based favorites

create table user_favorites (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('conferences','papers','leads','talents','opensource','news','jobs','products','vendors')),
  entity_id text not null,
  label text not null default '',
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id)
);

create index idx_user_favorites_entity on user_favorites(entity_type, entity_id);

-- RLS — matches other tables in the app (single-admin dashboard, no per-user isolation)
alter table user_favorites enable row level security;

create policy "anon select user_favorites" on user_favorites
  for select using (true);

create policy "anon insert user_favorites" on user_favorites
  for insert with check (true);

create policy "anon delete user_favorites" on user_favorites
  for delete using (true);
