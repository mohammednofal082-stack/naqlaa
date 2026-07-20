-- Naqlah — missing operational tables (run after 001 + 002)
-- internship tracking, partnerships, assessments, event check-in

create table if not exists public.internship_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  university_id text not null,
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  internship_id uuid references public.internships(id) on delete set null,
  supervisor_id uuid references public.profiles(id),
  status text not null default 'requested'
    check (status in (
      'requested','university_approved','company_accepted',
      'in_progress','reports_pending','completed','failed','cancelled',
      'pending','approved','rejected','active'
    )),
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  internship_request_id uuid not null references public.internship_requests(id) on delete cascade,
  week_number int not null check (week_number > 0),
  title text not null default '',
  tasks_done text not null default '',
  skills_used text[] default '{}',
  challenges text default '',
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  submitted_at timestamptz not null default now(),
  unique (internship_request_id, week_number)
);

create table if not exists public.partnerships (
  id uuid primary key default gen_random_uuid(),
  university_id text not null,
  company_id uuid not null references public.companies(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','active','expired')),
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  title text not null,
  type text not null default 'mcq'
    check (type in ('mcq','coding','upload','video')),
  deadline timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  qr_code text not null default encode(gen_random_bytes(16), 'hex'),
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.internship_requests enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.partnerships enable row level security;
alter table public.assessments enable row level security;
alter table public.event_registrations enable row level security;

create policy "internship_requests_read" on public.internship_requests
  for select using (true);
create policy "internship_requests_write_auth" on public.internship_requests
  for all using (auth.uid() is not null);

create policy "weekly_reports_read" on public.weekly_reports
  for select using (true);
create policy "weekly_reports_write_auth" on public.weekly_reports
  for all using (auth.uid() is not null);

create policy "partnerships_read" on public.partnerships
  for select using (true);
create policy "partnerships_write_auth" on public.partnerships
  for all using (auth.uid() is not null);

create policy "assessments_read" on public.assessments
  for select using (true);
create policy "assessments_write_auth" on public.assessments
  for all using (auth.uid() is not null);

create policy "event_registrations_own" on public.event_registrations
  for select using (auth.uid() = user_id or true);
create policy "event_registrations_insert" on public.event_registrations
  for insert with check (auth.uid() = user_id);
create policy "event_registrations_update" on public.event_registrations
  for update using (auth.uid() = user_id or auth.uid() is not null);
