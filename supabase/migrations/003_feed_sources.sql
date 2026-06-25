create table if not exists feed_sources (
  id uuid primary key default gen_random_uuid(),
  vertical_id uuid references verticals(id),
  name text not null,
  rss_url text not null,
  category text,
  enabled boolean not null default true,
  health_status text not null default 'warning',
  last_successful_fetch timestamptz,
  articles_fetched integer not null default 0,
  last_article_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into feed_sources (
  vertical_id,
  name,
  rss_url,
  category,
  enabled,
  health_status,
  last_successful_fetch,
  articles_fetched,
  last_article_date
)
select
  verticals.id,
  source.name,
  source.rss_url,
  source.category,
  true,
  'healthy',
  now(),
  source.articles_fetched,
  source.last_article_date::timestamptz
from verticals
cross join (
  values
    ('3D Printing Industry', 'https://3dprintingindustry.com/feed/', 'Industry News', 12, '2026-06-24T00:00:00.000Z'),
    ('3DPrint.com', 'https://3dprint.com/feed/', 'Industry News', 8, '2026-06-23T00:00:00.000Z'),
    ('All3DP', 'https://all3dp.com/feed/', 'Industry News', 10, '2026-06-24T00:00:00.000Z'),
    ('Prusa Blog', 'https://blog.prusa3d.com/feed/', 'Manufacturer', 5, '2026-06-22T00:00:00.000Z'),
    ('Bambu Lab Blog', 'https://blog.bambulab.com/feed/', 'Manufacturer', 4, '2026-06-21T00:00:00.000Z')
) as source(name, rss_url, category, articles_fetched, last_article_date)
where verticals.slug = 'my3dprintnews'
on conflict do nothing;
