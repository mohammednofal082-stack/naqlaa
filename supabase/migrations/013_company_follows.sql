-- Company follows for Follow button on company pages

create table if not exists public.company_follows (
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, company_id)
);

alter table public.company_follows enable row level security;
drop policy if exists "company_follows_read" on public.company_follows;
create policy "company_follows_read" on public.company_follows for select using (true);
drop policy if exists "company_follows_write_own" on public.company_follows;
create policy "company_follows_write_own" on public.company_follows
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
