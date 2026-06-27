alter table articles
  add column if not exists editorial_status text not null default 'published',
  add column if not exists editorial_status_updated_at timestamptz,
  add column if not exists editorial_status_reason text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'articles_editorial_status_check'
  ) then
    alter table articles
      add constraint articles_editorial_status_check
      check (
        editorial_status in (
          'published',
          'flagged',
          'paused',
          'excluded',
          'hidden',
          'blocked'
        )
      );
  end if;
end $$;

create table if not exists editorial_cases (
  id uuid primary key default gen_random_uuid(),
  vertical_id uuid references verticals(id) on delete set null,
  article_id uuid references articles(id) on delete set null,
  campaign_id uuid references campaigns(id) on delete set null,
  raised_by_role text not null check (
    raised_by_role in ('reader', 'licence_holder', 'platform')
  ),
  raised_by_email text,
  reason text not null check (
    reason in (
      'inappropriate',
      'adult',
      'violence',
      'drugs',
      'competitor_conflict',
      'copyright',
      'misinformation',
      'irrelevant',
      'sponsor_concern',
      'other'
    )
  ),
  notes text,
  severity text not null default 'normal' check (
    severity in ('low', 'normal', 'high', 'urgent')
  ),
  status text not null default 'open' check (
    status in ('open', 'under_review', 'resolved', 'dismissed')
  ),
  action_taken text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists editorial_actions (
  id uuid primary key default gen_random_uuid(),
  editorial_case_id uuid references editorial_cases(id) on delete set null,
  vertical_id uuid references verticals(id) on delete set null,
  article_id uuid references articles(id) on delete set null,
  campaign_id uuid references campaigns(id) on delete set null,
  actor_role text not null check (
    actor_role in ('reader', 'licence_holder', 'platform')
  ),
  action_type text not null check (
    action_type in (
      'report',
      'pause_article',
      'resume_article',
      'exclude_from_editions',
      'hide_from_publication',
      'block_platform_wide',
      'pause_campaign',
      'resume_campaign',
      'withdraw_campaign',
      'dismiss_case',
      'resolve_case'
    )
  ),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists editorial_cases_status_idx
  on editorial_cases(status, severity, created_at);

create index if not exists editorial_cases_vertical_idx
  on editorial_cases(vertical_id);

create index if not exists editorial_cases_article_idx
  on editorial_cases(article_id);

create index if not exists editorial_actions_case_idx
  on editorial_actions(editorial_case_id);

create index if not exists editorial_actions_article_idx
  on editorial_actions(article_id);

create index if not exists articles_editorial_status_idx
  on articles(editorial_status);
