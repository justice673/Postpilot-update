-- Run this in the Supabase SQL editor before enabling LinkedIn connect/publish.

-- Settings: LinkedIn OAuth tokens + profile
alter table public.settings
  add column if not exists linkedin_connected boolean not null default false,
  add column if not exists linkedin_username text,
  add column if not exists linkedin_access_token text,
  add column if not exists linkedin_refresh_token text,
  add column if not exists linkedin_token_expires_at timestamptz,
  add column if not exists linkedin_person_urn text;

-- Posts: which channel to publish to
alter table public.posts
  add column if not exists platform text not null default 'x';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'posts_platform_check'
  ) then
    alter table public.posts
      add constraint posts_platform_check
      check (platform in ('x', 'linkedin'));
  end if;
end $$;

create index if not exists posts_pending_platform_scheduled_idx
  on public.posts (status, platform, scheduled_at);
