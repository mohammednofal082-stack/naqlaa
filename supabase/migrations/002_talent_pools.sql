-- Naqlah — Talent pools (قوائم المواهب)
-- Run after 001_initial_schema.sql

create table if not exists public.talent_pools (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  owner_id uuid references public.profiles(id),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.talent_pool_members (
  pool_id uuid not null references public.talent_pools(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (pool_id, user_id)
);

alter table public.talent_pools enable row level security;
alter table public.talent_pool_members enable row level security;

-- Pool owner (company side) manages their own pools
create policy "talent_pools_owner_all" on public.talent_pools
  for all using (auth.uid() = owner_id);

create policy "talent_pool_members_owner_all" on public.talent_pool_members
  for all using (
    exists (
      select 1 from public.talent_pools p
      where p.id = pool_id and p.owner_id = auth.uid()
    )
  );
