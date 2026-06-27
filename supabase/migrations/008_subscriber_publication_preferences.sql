create table if not exists subscriber_publication_preferences (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid references subscribers(id) on delete cascade,
  vertical_id uuid references verticals(id),
  frequency text not null default 'daily',
  enabled boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (subscriber_id, vertical_id)
);
