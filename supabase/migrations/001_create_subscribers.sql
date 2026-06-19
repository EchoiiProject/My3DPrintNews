create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  token text unique not null,
  frequency text not null,
  weekly_day text null,
  monthly_timing text null,
  story_count integer,
  preferences jsonb not null,
  favourites jsonb not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists subscribers_token_idx on public.subscribers (token);

create or replace function public.set_subscribers_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_subscribers_updated_at on public.subscribers;

create trigger set_subscribers_updated_at
before update on public.subscribers
for each row execute function public.set_subscribers_updated_at();
