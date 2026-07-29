-- Naqlah — CV storage metadata + course modules + lessons
-- Run after 001–006
-- Create Storage bucket "cvs" in Supabase Dashboard (public or authenticated) after this.

create table if not exists public.cv_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  public_url text,
  extracted_chars int default 0,
  created_at timestamptz not null default now()
);

alter table public.cv_files enable row level security;
drop policy if exists "cv_files_own" on public.cv_files;
create policy "cv_files_own" on public.cv_files
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "cv_files_read_auth" on public.cv_files;
create policy "cv_files_read_auth" on public.cv_files
  for select using (auth.uid() is not null);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  sort_order int not null default 1,
  lessons_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  content text default '',
  duration_minutes int default 10,
  sort_order int not null default 1,
  created_at timestamptz not null default now()
);

alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;

drop policy if exists "course_modules_read" on public.course_modules;
create policy "course_modules_read" on public.course_modules for select using (true);
drop policy if exists "course_modules_write" on public.course_modules;
create policy "course_modules_write" on public.course_modules
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "course_lessons_read" on public.course_lessons;
create policy "course_lessons_read" on public.course_lessons for select using (true);
drop policy if exists "course_lessons_write" on public.course_lessons;
create policy "course_lessons_write" on public.course_lessons
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Seed one module per existing course if empty
insert into public.course_modules (course_id, title, sort_order, lessons_count)
select c.id, 'الوحدة الأولى', 1, 0
from public.courses c
where not exists (select 1 from public.course_modules m where m.course_id = c.id);
