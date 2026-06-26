alter table verticals
  add column if not exists publication_name text,
  add column if not exists publication_description text,
  add column if not exists hostname text,
  add column if not exists publication_status text not null default 'draft',
  add column if not exists auto_fetch_enabled boolean not null default true,
  add column if not exists show_in_discover boolean not null default true,
  add column if not exists show_newsletter_signup boolean not null default true,
  add column if not exists show_feedback boolean not null default true,
  add column if not exists logo_url text,
  add column if not exists hero_image_url text,
  add column if not exists primary_colour text;

alter table verticals
  alter column visibility set default 'private';

do $$
begin
  alter table verticals
    add constraint verticals_visibility_values
    check (visibility in ('private', 'demo', 'public'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table verticals
    add constraint verticals_publication_status_values
    check (publication_status in ('draft', 'live', 'archived'));
exception
  when duplicate_object then null;
end $$;

update verticals
set
  publication_name = 'My3DPrintNews',
  publication_description = 'Daily news, reviews and industry insight from the global 3D printing sector.',
  slug = '3dprint',
  visibility = 'public',
  publication_status = 'live',
  hostname = '3dprint.mynewsnetwork.uk',
  auto_fetch_enabled = true,
  show_in_discover = true,
  show_newsletter_signup = true,
  show_feedback = true,
  updated_at = now()
where id = '33333333-3333-4333-8333-333333333333'
  or slug in ('my3dprintnews', '3dprint');

update verticals
set
  publication_name = 'MyBMXNews',
  slug = 'bmx',
  visibility = 'demo',
  publication_status = 'draft',
  hostname = 'bmx.mynewsnetwork.uk',
  auto_fetch_enabled = true,
  show_in_discover = true,
  show_newsletter_signup = true,
  show_feedback = true,
  updated_at = now()
where id = '44444444-4444-4444-8444-444444444444'
  or slug in ('mybmxnews', 'bmx');
