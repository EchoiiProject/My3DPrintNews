create table if not exists reader_email_queue (
  id uuid primary key default gen_random_uuid(),
  vertical_id uuid references verticals(id),
  article_id uuid references articles(id),
  email text not null,
  request_type text not null check (request_type in ('article', 'feed')),
  publication_name text,
  publication_url text,
  filter_context jsonb default '{}',
  article_title text,
  article_source text,
  article_summary text,
  article_url text,
  feed_items jsonb default '[]',
  status text not null default 'pending',
  created_at timestamptz default now()
);
