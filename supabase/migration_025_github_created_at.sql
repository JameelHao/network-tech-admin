-- Add GitHub repo creation date for timeline
alter table github_repos add column if not exists gh_created_at timestamptz;

create index if not exists idx_github_repos_gh_created_at on github_repos(gh_created_at desc);
