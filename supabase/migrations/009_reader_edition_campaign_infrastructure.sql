create table if not exists reader_profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reader_publication_preferences (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid not null references reader_profiles(id) on delete cascade,
  vertical_id uuid not null references verticals(id) on delete cascade,
  frequency text not null default 'daily',
  include_favourites boolean not null default true,
  include_videos boolean not null default true,
  include_reviews boolean not null default true,
  max_items integer not null default 10,
  is_subscribed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reader_id, vertical_id)
);

create table if not exists reader_reading_list (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid not null references reader_profiles(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  vertical_id uuid references verticals(id) on delete cascade,
  status text not null default 'saved',
  saved_at timestamptz not null default now(),
  unique (reader_id, article_id)
);

create table if not exists newsletter_editions (
  id uuid primary key default gen_random_uuid(),
  vertical_id uuid references verticals(id) on delete cascade,
  reader_id uuid references reader_profiles(id) on delete set null,
  frequency text,
  edition_date date,
  title text,
  status text not null default 'draft',
  magic_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists newsletter_edition_items (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references newsletter_editions(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  section text,
  position integer,
  created_at timestamptz not null default now()
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  vertical_id uuid references verticals(id) on delete set null,
  owner_scope text not null check (owner_scope in ('platform', 'licence_holder')),
  title text not null,
  description text,
  image_url text,
  destination_url text,
  discount_code text,
  status text not null default 'draft' check (
    status in (
      'draft',
      'scheduled',
      'live',
      'paused',
      'expired',
      'withdrawn'
    )
  ),
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists campaign_placements (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  placement_key text not null,
  priority integer not null default 100,
  created_at timestamptz not null default now()
);

create index if not exists reader_publication_preferences_reader_idx
  on reader_publication_preferences(reader_id);

create index if not exists reader_publication_preferences_vertical_idx
  on reader_publication_preferences(vertical_id);

create index if not exists reader_reading_list_reader_idx
  on reader_reading_list(reader_id);

create index if not exists reader_reading_list_vertical_idx
  on reader_reading_list(vertical_id);

create index if not exists newsletter_editions_token_idx
  on newsletter_editions(magic_token);

create index if not exists newsletter_editions_vertical_date_idx
  on newsletter_editions(vertical_id, edition_date);

create index if not exists newsletter_edition_items_edition_position_idx
  on newsletter_edition_items(edition_id, position);

create index if not exists campaigns_vertical_status_idx
  on campaigns(vertical_id, status);

create index if not exists campaign_placements_key_idx
  on campaign_placements(placement_key);
