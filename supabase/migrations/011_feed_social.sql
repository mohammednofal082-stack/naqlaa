-- Feed social: likes table + post metadata for filters/tags

alter table public.feed_posts
  add column if not exists post_type text not null default 'update'
    check (post_type in ('update','job','achievement','event','article')),
  add column if not exists tags text[] not null default '{}',
  add column if not exists job_id uuid references public.jobs(id) on delete set null,
  add column if not exists event_id uuid references public.events(id) on delete set null;

create table if not exists public.feed_post_likes (
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.feed_post_likes enable row level security;

drop policy if exists "feed_likes_read" on public.feed_post_likes;
create policy "feed_likes_read" on public.feed_post_likes
  for select using (true);

drop policy if exists "feed_likes_write_own" on public.feed_post_likes;
create policy "feed_likes_write_own" on public.feed_post_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Keep likes_count in sync via trigger
create or replace function public.sync_feed_likes_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    update public.feed_posts set likes_count = coalesce(likes_count, 0) + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.feed_posts set likes_count = greatest(coalesce(likes_count, 0) - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_feed_likes_count on public.feed_post_likes;
create trigger trg_feed_likes_count
after insert or delete on public.feed_post_likes
for each row execute function public.sync_feed_likes_count();
