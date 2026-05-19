-- paper_topics junction table for normalized paper-topic relationship

create table paper_topics (
  paper_id uuid not null references papers(id) on delete cascade,
  topic_slug text not null references admin_topics(slug) on delete cascade,
  primary key (paper_id, topic_slug)
);

create index idx_paper_topics_topic on paper_topics(topic_slug);
create index idx_paper_topics_paper on paper_topics(paper_id);

-- migrate existing data
insert into paper_topics (paper_id, topic_slug)
select id, unnest(topics) from papers
where topics is not null and array_length(topics, 1) > 0;

-- drop old column
alter table papers drop column topics;

-- RLS
alter table paper_topics enable row level security;
create policy "anon read paper_topics" on paper_topics for select using (true);
create policy "anon insert paper_topics" on paper_topics for insert to anon with check (true);
create policy "anon delete paper_topics" on paper_topics for delete to anon using (true);
