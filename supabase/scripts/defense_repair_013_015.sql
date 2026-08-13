-- Naqla — one-shot repair for thesis defense
-- Paste into Supabase Dashboard → SQL Editor → Run
-- Covers 013 + 014 + 015 schema (idempotent). Does NOT depend on Storage policies.

-- 013 company follows
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

-- 014 interview meeting url
alter table public.applications
  add column if not exists meeting_url text;

-- 015 media / builders schema
alter table public.course_lessons add column if not exists video_url text;
alter table public.messages add column if not exists attachment_url text;
alter table public.companies add column if not exists email text;
alter table public.companies add column if not exists employees_count int default 0;
alter table public.companies add column if not exists founded_year int;
alter table public.assessments add column if not exists description text;
alter table public.assessments add column if not exists questions jsonb default '[]'::jsonb;
