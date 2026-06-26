alter table vertical_sources
  add column if not exists source_type text not null default 'rss';

do $$
begin
  alter table vertical_sources
    add constraint vertical_sources_source_type_values
    check (source_type in ('rss', 'youtube', 'podcast', 'blog', 'brand', 'creator'));
exception
  when duplicate_object then null;
end $$;

update vertical_sources
set source_type = 'rss'
where source_type is null;
