-- Fix company backfill — use word-boundary matching instead of LIKE '%keyword%'
-- Prevents false positives like "IntelliJ" matching Intel, "microns" matching Micron, etc.

-- Recompute companies for news_items using \m...\M word boundary regex
update news_items set companies = (
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
      regexp_like(lower(coalesce(news_items.title, '')), '\m' || kw || '\M')
      or regexp_like(lower(coalesce(news_items.snippet, '')), '\m' || kw || '\M')
  )
);
