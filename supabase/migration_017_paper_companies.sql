-- Add companies column to papers table
alter table papers add column companies text[] not null default '{}';
