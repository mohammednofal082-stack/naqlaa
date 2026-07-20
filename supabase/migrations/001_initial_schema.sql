-- Naqlah (نقلة) — Supabase schema
-- Run in Supabase SQL Editor or via: supabase db push

create extension if not exists "pgcrypto";

-- ─── Profiles (linked to auth.users) ───
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  avatar_url text,
  phone text,
  roles text[] not null default '{student}',
  active_role text not null default 'student',
  status text not null default 'active' check (status in ('pending','active','suspended','deleted')),
  organization_id uuid,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  headline text,
  location text,
  about text,
  cover_photo_url text,
  university_id text,
  department_id text,
  major text,
  graduation_year int,
  study_year int,
  student_number text,
  education jsonb default '[]',
  skills text[] default '{}',
  experience jsonb default '[]',
  certifications jsonb default '[]',
  projects jsonb default '[]',
  profile_completion int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_name text not null,
  level int not null default 50 check (level between 0 and 100),
  unique (user_id, skill_name)
);

-- ─── Companies ───
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id),
  name text not null,
  industry text not null,
  description text,
  logo_url text,
  cover_url text,
  website text,
  location text,
  size text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── Jobs & Internships ───
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text not null,
  requirements text[] default '{}',
  skills text[] default '{}',
  salary_min int,
  salary_max int,
  currency text default 'USD',
  location text,
  work_type text not null default 'on-site',
  job_type text not null default 'job',
  experience_level text,
  industry text,
  applicants_count int default 0,
  status text not null default 'published',
  posted_at timestamptz not null default now()
);

create table if not exists public.internships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text not null,
  requirements text[] default '{}',
  duration text,
  paid boolean default false,
  salary int,
  location text,
  work_type text,
  train_to_hire boolean default false,
  applicants_count int default 0,
  status text not null default 'published',
  posted_at timestamptz not null default now()
);

-- ─── Applications ───
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  internship_id uuid references public.internships(id) on delete set null,
  company_id uuid not null references public.companies(id),
  status text not null default 'applied',
  match_score int,
  cover_letter text,
  interview_date timestamptz,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_jobs (
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

-- ─── Courses ───
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references public.profiles(id),
  title text not null,
  description text,
  category text,
  level text,
  duration text,
  modules_count int default 0,
  enrolled_count int default 0,
  rating numeric(3,2) default 0,
  status text not null default 'published',
  certificate_enabled boolean default true,
  created_at timestamptz not null default now()
);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  progress int default 0,
  enrolled_at timestamptz not null default now(),
  unique (course_id, student_id)
);

-- ─── Mentorship ───
create table if not exists public.mentor_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  expertise_area text,
  current_title text,
  experience_years int,
  bio text,
  verified boolean default false,
  rating numeric(3,2) default 0,
  sessions_count int default 0
);

create table if not exists public.mentorship_sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.profiles(id),
  mentee_id uuid not null references public.profiles(id),
  topic text not null,
  scheduled_at timestamptz not null,
  duration_minutes int default 45,
  status text not null default 'requested',
  meeting_link text,
  feedback text,
  rating int,
  created_at timestamptz not null default now()
);

-- ─── Events ───
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references public.profiles(id),
  title text not null,
  description text,
  location text,
  event_date timestamptz not null,
  capacity int,
  registered_count int default 0,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

-- ─── Messaging ───
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_ids uuid[] not null,
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  content text not null,
  read boolean default false,
  created_at timestamptz not null default now()
);

-- ─── Notifications ───
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type text not null,
  link text,
  read boolean default false,
  created_at timestamptz not null default now()
);

-- ─── Feed ───
create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  image_url text,
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamptz not null default now()
);

-- ─── Audit ───
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ─── RLS (enable — policies to refine per role) ───
alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.internships enable row level security;
alter table public.applications enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;

create policy "profiles_read_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "jobs_public_read" on public.jobs for select using (status = 'published');
create policy "internships_public_read" on public.internships for select using (status = 'published');
create policy "applications_own" on public.applications for select using (auth.uid() = student_id);
create policy "notifications_own" on public.notifications for select using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
