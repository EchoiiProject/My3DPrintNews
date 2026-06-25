create extension if not exists "pgcrypto";

create table if not exists organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website_url text,
  logo_url text,
  contact_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists verticals (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references organisations(id),
  name text not null,
  slug text unique not null,
  description text,
  status text not null,
  visibility text not null,
  strategy text not null,
  sponsor_id text,
  public_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists vertical_memberships (
  id uuid primary key default gen_random_uuid(),
  vertical_id uuid references verticals(id),
  email text not null,
  role text not null,
  created_at timestamptz default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  vertical_id uuid references verticals(id),
  category text not null,
  rating integer,
  message text not null,
  email text,
  status text not null default 'new',
  created_at timestamptz default now()
);

-- Demo seed data for the first white-label ownership model.
-- Replace emails/domains with production values before using outside review.
insert into organisations (
  id,
  name,
  website_url,
  contact_email
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'Echoii',
    'https://echoii.example.com',
    'owner@example.com'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'SSS Racing',
    'https://sssracing.example.com',
    'bmx-owner@example.com'
  )
on conflict (id) do update set
  name = excluded.name,
  website_url = excluded.website_url,
  contact_email = excluded.contact_email,
  updated_at = now();

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
  public_url
) values
  (
    '33333333-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    'My3DPrintNews',
    'my3dprintnews',
    'Personalised 3D printing news, videos, products, and updates.',
    'active',
    'public',
    'owned',
    null,
    '/'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '22222222-2222-4222-8222-222222222222',
    'MyBMXNews',
    'mybmxnews',
    'Demo BMX vertical for reusable personalised feed products.',
    'active',
    'public',
    'sponsored',
    'sss-racing',
    '/discover-more'
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
  updated_at = now();

insert into vertical_memberships (
  vertical_id,
  email,
  role
) values
  (
    '33333333-3333-4333-8333-333333333333',
    'peter@example.com',
    'platform_owner'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'sss-racing@example.com',
    'vertical_owner'
  )
on conflict do nothing;

insert into feedback (
  vertical_id,
  category,
  rating,
  message,
  email,
  status,
  created_at
) values
  (
    '33333333-3333-4333-8333-333333333333',
    'source_request',
    4,
    'Please add more resin printing sources and creator videos.',
    'reader@example.com',
    'new',
    '2026-06-24T09:15:00.000Z'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'praise',
    5,
    'Focus Mode is really useful for checking Prusa stories quickly.',
    null,
    'reviewed',
    '2026-06-23T14:20:00.000Z'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'general',
    4,
    'Would like regional event coverage when the BMX vertical launches.',
    null,
    'new',
    '2026-06-24T11:30:00.000Z'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'commercial_suggestion',
    3,
    'Local retailers may want weekly product placement options.',
    'partner@example.com',
    'reviewed',
    '2026-06-21T10:05:00.000Z'
  );
