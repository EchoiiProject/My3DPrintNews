create table if not exists reader_hidden_sources (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid references reader_profiles(id),
  email text,
  vertical_id uuid references verticals(id),
  source_id uuid references vertical_sources(id),
  muted_until timestamptz,
  reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists reader_hidden_sources_reader_source_idx
  on reader_hidden_sources(reader_id, source_id)
  where reader_id is not null;

create unique index if not exists reader_hidden_sources_email_source_idx
  on reader_hidden_sources(email, source_id)
  where email is not null;

create index if not exists reader_hidden_sources_vertical_idx
  on reader_hidden_sources(vertical_id);
