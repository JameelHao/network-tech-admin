-- Stores per-entity sync metadata (last sync timestamp and result)
create table if not exists sync_meta (
  entity text primary key,
  last_sync_at timestamptz not null default now(),
  last_result jsonb
);
