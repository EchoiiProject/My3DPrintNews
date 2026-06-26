create table if not exists vertical_sources (
  id uuid primary key default gen_random_uuid(),
  vertical_id uuid references verticals(id),
  name text not null,
  rss_url text not null,
  category text,
  enabled boolean not null default true,
  status text not null default 'active',
  health_status text,
  last_checked_at timestamptz,
  last_successful_fetch_at timestamptz,
  last_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  vertical_id uuid references verticals(id),
  source_id uuid references vertical_sources(id),
  title text not null,
  url text not null,
  summary text,
  image_url text,
  author text,
  published_at timestamptz,
  source_name text,
  tags jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint articles_url_unique unique (url)
);

insert into vertical_sources (
  vertical_id,
  name,
  rss_url,
  category,
  enabled,
  status,
  health_status
)
select
  verticals.id,
  source.name,
  source.rss_url,
  source.category,
  source.enabled,
  source.status,
  case when source.enabled then 'warning' else 'offline' end
from verticals
cross join (
  values
    ('3D Printing Industry', 'https://3dprintingindustry.com/feed/', 'Industry News', true, 'active'),
    ('3DPrint.com', 'https://3dprint.com/feed/', 'Industry News', true, 'active'),
    ('All3DP News', 'https://all3dp.com/feed/', 'Industry News', true, 'active'),
    ('Fabbaloo', 'https://www.fabbaloo.com/feed', 'Industry News', false, 'placeholder'),
    ('TCT Magazine', 'https://www.tctmagazine.com/rss/', 'Industry News', true, 'active'),
    ('DEVELOP3D', 'https://develop3d.com/feed/', 'Industry News', true, 'active'),
    ('3DPrinting.com', 'https://3dprinting.com/feed/', 'Industry News', true, 'active'),
    ('3DSourced', 'https://www.3dsourced.com/feed/', 'Industry News', true, 'active'),
    ('3D Insider', 'https://3dinsider.com/feed/', 'Industry News', true, 'active'),
    ('3ders.org', 'https://www.3ders.org/rss.xml', 'Industry News', false, 'placeholder'),
    ('TOM''s 3D', 'https://toms3d.org/feed/', 'Industry News', false, 'placeholder'),
    ('Total 3D Printing', 'https://total3dprinting.org/feed/', 'Industry News', false, 'placeholder'),
    ('Prusa Blog', 'https://blog.prusa3d.com/feed/', 'Manufacturer', true, 'active'),
    ('Bambu Lab Blog', 'https://blog.bambulab.com/feed/', 'Manufacturer', true, 'active'),
    ('Creality Blog', 'https://www.creality.com/blog/rss', 'Manufacturer', false, 'placeholder'),
    ('UltiMaker Blog', 'https://ultimaker.com/blog/feed/', 'Manufacturer', true, 'active'),
    ('Formlabs Blog', 'https://formlabs.com/blog/rss/', 'Manufacturer', false, 'placeholder'),
    ('Markforged Blog', 'https://markforged.com/resources/blog/rss.xml', 'Manufacturer', false, 'placeholder'),
    ('BigRep Blog', 'https://bigrep.com/feed/', 'Manufacturer', true, 'active'),
    ('WASP Blog', 'https://www.3dwasp.com/en/feed/', 'Manufacturer', false, 'placeholder'),
    ('Stratasys Blog', 'https://www.stratasys.com/en/resources/blog/feed/', 'Manufacturer', false, 'placeholder'),
    ('Raise3D Blog', 'https://www.raise3d.com/feed/', 'Manufacturer', true, 'active'),
    ('BCN3D Blog', 'https://www.bcn3d.com/feed/', 'Manufacturer', true, 'active'),
    ('MatterHackers', 'https://www.matterhackers.com/rss', 'Industry News', false, 'placeholder'),
    ('3DPrintBeginner', 'https://3dprintbeginner.com/feed/', 'Industry News', true, 'active'),
    ('3DWithUs', 'https://3dwithus.com/feed', 'Industry News', true, 'active'),
    ('Treatstock Blog', 'https://www.treatstock.com/blog/rss', 'Industry News', true, 'active'),
    ('Cults Blog', 'https://cults3d.com/en/blog.rss', 'Industry News', false, 'placeholder'),
    ('Shapeways Blog', 'https://www.shapeways.com/blog/feed', 'Industry News', false, 'placeholder'),
    ('i.materialise Blog', 'https://i.materialise.com/blog/en/feed/', 'Industry News', false, 'placeholder'),
    ('Simplify3D Blog', 'https://www.simplify3d.com/feed/', 'Industry News', false, 'placeholder')
) as source(name, rss_url, category, enabled, status)
where verticals.slug = 'my3dprintnews'
and not exists (
  select 1
  from vertical_sources existing
  where existing.vertical_id = verticals.id
  and existing.rss_url = source.rss_url
);
