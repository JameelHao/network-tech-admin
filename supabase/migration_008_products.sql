create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vendor text,
  category text not null default 'platform',
  description text,
  url text,
  changelog_url text,
  latest_version text,
  release_date date,
  pricing text not null default 'unknown',
  topics text[] not null default '{}',
  stage text not null default 'watching',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category);
create index if not exists idx_products_vendor on products(vendor);
create index if not exists idx_products_stage on products(stage);

alter table products enable row level security;
create policy "anon read products" on products for select to anon using (true);
create policy "anon insert products" on products for insert to anon with check (true);
create policy "anon update products" on products for update to anon using (true);
