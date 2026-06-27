create table if not exists reader_hidden_items (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid references reader_profiles(id) on delete cascade,
  email text,
  article_id uuid not null references articles(id) on delete cascade,
  vertical_id uuid references verticals(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

create unique index if not exists reader_hidden_items_reader_article_idx
  on reader_hidden_items(reader_id, article_id)
  where reader_id is not null;

create unique index if not exists reader_hidden_items_email_article_idx
  on reader_hidden_items(lower(email), article_id)
  where email is not null;

create index if not exists reader_hidden_items_article_idx
  on reader_hidden_items(article_id);

create index if not exists reader_hidden_items_vertical_idx
  on reader_hidden_items(vertical_id);
