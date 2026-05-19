-- Backfill companies on existing papers using keyword matching
-- Mirrors logic in src/lib/admin/paper-import.ts → inferPaperCompanies()

update papers set companies = (
  select coalesce(array_agg(c.slug order by c.slug), '{}')
  from (
    values
      ('cisco',     array['cisco']),
      ('google',    array['google', 'alphabet', 'gcp']),
      ('ericsson',  array['ericsson']),
      ('nokia',     array['nokia']),
      ('aws',       array['aws', 'amazon web services']),
      ('azure',     array['azure']),
      ('microsoft', array['microsoft']),
      ('openai',    array['openai']),
      ('anthropic', array['anthropic']),
      ('nvidia',    array['nvidia']),
      ('meta',      array['meta', 'facebook']),
      ('micron',    array['micron']),
      ('broadcom',  array['broadcom']),
      ('intel',     array['intel']),
      ('ibm',       array['ibm']),
      ('huawei',    array['huawei']),
      ('cloudflare',array['cloudflare']),
      ('apple',     array['apple']),
      ('amd',       array['amd']),
      ('tencent',   array['tencent']),
      ('alibaba',   array['alibaba', 'alibab']),
      ('baidu',     array['baidu']),
      ('bytedance', array['bytedance', 'tiktok'])
  ) as c(slug, keywords)
  where exists (
    select 1 from unnest(c.keywords) as kw
    where
      lower(coalesce(papers.title, '')) like '%' || kw || '%'
      or lower(coalesce(papers.abstract, '')) like '%' || kw || '%'
  )
)
where companies is null or array_length(companies, 1) is null or companies = '{}';
