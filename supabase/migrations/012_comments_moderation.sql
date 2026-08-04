-- Comments, moderation reports, platform settings

create table if not exists public.feed_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_feed_comments_post on public.feed_post_comments(post_id, created_at desc);

alter table public.feed_post_comments enable row level security;
drop policy if exists "feed_comments_read" on public.feed_post_comments;
create policy "feed_comments_read" on public.feed_post_comments for select using (true);
drop policy if exists "feed_comments_write_own" on public.feed_post_comments;
create policy "feed_comments_write_own" on public.feed_post_comments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.sync_feed_comments_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    update public.feed_posts set comments_count = coalesce(comments_count, 0) + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.feed_posts set comments_count = greatest(coalesce(comments_count, 0) - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_feed_comments_count on public.feed_post_comments;
create trigger trg_feed_comments_count
after insert or delete on public.feed_post_comments
for each row execute function public.sync_feed_comments_count();

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null check (target_type in ('profile','message','job','post','company','other')),
  target_id text,
  target_label text not null default '',
  reason text not null,
  status text not null default 'pending' check (status in ('pending','reviewed','banned')),
  link text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null
);

alter table public.content_reports enable row level security;
drop policy if exists "content_reports_read_auth" on public.content_reports;
create policy "content_reports_read_auth" on public.content_reports
  for select using (auth.uid() is not null);
drop policy if exists "content_reports_insert_auth" on public.content_reports;
create policy "content_reports_insert_auth" on public.content_reports
  for insert with check (auth.uid() is not null);
drop policy if exists "content_reports_update_auth" on public.content_reports;
create policy "content_reports_update_auth" on public.content_reports
  for update using (auth.uid() is not null);

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

alter table public.platform_settings enable row level security;
drop policy if exists "platform_settings_read_auth" on public.platform_settings;
create policy "platform_settings_read_auth" on public.platform_settings
  for select using (auth.uid() is not null);
drop policy if exists "platform_settings_write_auth" on public.platform_settings;
create policy "platform_settings_write_auth" on public.platform_settings
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

insert into public.platform_settings (key, value) values
  ('security_policies', '{"twoFactor":true,"logIp":true,"rateLimit":true,"encryption":true}'::jsonb)
on conflict (key) do nothing;
