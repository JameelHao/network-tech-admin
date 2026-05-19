-- Patent tracking for company technology intelligence
create table patents (
  id uuid primary key default gen_random_uuid(),
  publication_number text not null unique,
  title text not null,
  snippet text,
  assignee text not null,
  company_slug text not null,
  inventors text[] default '{}',
  filing_date date,
  priority_date date,
  publication_date date,
  url text not null,
  created_at timestamptz not null default now()
);

create index idx_patents_company on patents(company_slug);
create index idx_patents_pub_date on patents(publication_date desc);

alter table patents enable row level security;

create policy "anon select patents" on patents for select using (true);
create policy "anon insert patents" on patents for insert with check (true);
create policy "anon delete patents" on patents for delete using (true);
