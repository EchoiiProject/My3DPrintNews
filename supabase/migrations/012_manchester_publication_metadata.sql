alter table verticals
  add column if not exists publication_type text,
  add column if not exists default_collections jsonb not null default '[]'::jsonb;

do $$
begin
  alter table verticals
    add constraint verticals_publication_type_values
    check (publication_type is null or publication_type in ('industry', 'interest', 'place'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table verticals
    add constraint verticals_default_collections_array
    check (jsonb_typeof(default_collections) = 'array');
exception
  when duplicate_object then null;
end $$;

update verticals
set
  publication_type = 'industry',
  default_collections = '["News","Reviews","Products","Videos","Business","Materials"]'::jsonb,
  updated_at = now()
where slug in ('my3dprintnews', '3dprint');

update verticals
set
  publication_type = 'interest',
  default_collections = '["Racing","Freestyle","Events","Products","Videos","Results"]'::jsonb,
  updated_at = now()
where slug in ('mybmxnews', 'bmx');

insert into verticals (
  id,
  organisation_id,
  name,
  slug,
  description,
  status,
  visibility,
  strategy,
  sponsor_id,
  public_url,
  publication_name,
  publication_description,
  publication_type,
  default_collections,
  hostname,
  publication_status,
  auto_fetch_enabled,
  show_in_discover,
  show_newsletter_signup,
  show_feedback,
  primary_colour
) values (
  '55555555-5555-4555-8555-555555555555',
  '11111111-1111-4111-8111-111111111111',
  'MyManchesterNews',
  'mymanchesternews',
  'Proof-of-concept place-based publication for Manchester readers.',
  'active',
  'demo',
  'community',
  null,
  '/publications/mymanchesternews',
  'MyManchesterNews',
  'Local news, business, transport, culture, events, and city updates for Manchester.',
  'place',
  '["News","Business","Transport","Planning","Property","Food","Culture","Events","Sport","Universities"]'::jsonb,
  'mymanchesternews.mynewsnetwork.uk',
  'draft',
  true,
  true,
  true,
  true,
  '#475569'
)
on conflict (slug) do update set
  organisation_id = excluded.organisation_id,
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  visibility = excluded.visibility,
  strategy = excluded.strategy,
  sponsor_id = excluded.sponsor_id,
  public_url = excluded.public_url,
  publication_name = excluded.publication_name,
  publication_description = excluded.publication_description,
  publication_type = excluded.publication_type,
  default_collections = excluded.default_collections,
  hostname = excluded.hostname,
  publication_status = excluded.publication_status,
  auto_fetch_enabled = excluded.auto_fetch_enabled,
  show_in_discover = excluded.show_in_discover,
  show_newsletter_signup = excluded.show_newsletter_signup,
  show_feedback = excluded.show_feedback,
  primary_colour = excluded.primary_colour,
  updated_at = now();
