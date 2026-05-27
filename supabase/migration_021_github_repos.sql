create table github_repos (
  id bigint primary key,
  company_slug text not null,
  name text not null,
  full_name text not null,
  description text,
  html_url text not null,
  homepage text,
  stars int not null default 0,
  language text,
  topics text[] default '{}',
  is_fork boolean not null default false,
  pushed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_github_repos_company on github_repos(company_slug);
create index idx_github_repos_stars on github_repos(stars desc);
create index idx_github_repos_pushed on github_repos(pushed_at desc);

alter table github_repos enable row level security;

create policy "anon read github_repos" on github_repos for select using (true);
create policy "anon insert github_repos" on github_repos for insert to anon with check (true);
create policy "anon update github_repos" on github_repos for update to anon using (true);
create policy "anon delete github_repos" on github_repos for delete to anon using (true);
