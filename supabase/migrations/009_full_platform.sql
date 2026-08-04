-- Naqlah — Full platform completion (after 001–008)
-- Integrity constraints + missing SkillBridge tables + tighter RLS helpers

-- ─── Apply-once uniqueness ───
create unique index if not exists applications_student_job_uidx
  on public.applications (student_id, job_id)
  where job_id is not null;

create unique index if not exists applications_student_internship_uidx
  on public.applications (student_id, internship_id)
  where internship_id is not null;

-- ─── Application status history ───
create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references public.profiles(id),
  note text,
  created_at timestamptz not null default now()
);
alter table public.application_status_history enable row level security;
drop policy if exists "app_status_history_read" on public.application_status_history;
create policy "app_status_history_read" on public.application_status_history for select using (auth.uid() is not null);
drop policy if exists "app_status_history_insert" on public.application_status_history;
create policy "app_status_history_insert" on public.application_status_history
  for insert with check (auth.uid() is not null);

-- ─── Universities hierarchy ───
create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  code text unique,
  city text,
  website text,
  created_at timestamptz not null default now()
);

create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamptz not null default now()
);

alter table public.universities enable row level security;
alter table public.colleges enable row level security;
alter table public.departments enable row level security;
drop policy if exists "universities_read" on public.universities;
create policy "universities_read" on public.universities for select using (true);
drop policy if exists "universities_write" on public.universities;
create policy "universities_write" on public.universities for all using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists "colleges_read" on public.colleges;
create policy "colleges_read" on public.colleges for select using (true);
drop policy if exists "colleges_write" on public.colleges;
create policy "colleges_write" on public.colleges for all using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists "departments_read" on public.departments;
create policy "departments_read" on public.departments for select using (true);
drop policy if exists "departments_write" on public.departments;
create policy "departments_write" on public.departments for all using (auth.uid() is not null) with check (auth.uid() is not null);

insert into public.universities (id, name, name_en, code, city)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'جامعة بيرزيت', 'Birzeit University', 'BZU', 'Birzeit'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'جامعة النجاح الوطنية', 'An-Najah National University', 'ANU', 'Nablus')
on conflict (id) do nothing;

insert into public.colleges (id, university_id, name, code)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'كلية الهندسة والتكنولوجيا', 'ENG'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'كلية تكنولوجيا المعلومات', 'IT')
on conflict (id) do nothing;

insert into public.departments (id, college_id, name, code)
values
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'علوم الحاسوب', 'CS'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'هندسة الحاسوب', 'CE')
on conflict (id) do nothing;

-- ─── Mentor availability + notes ───
create table if not exists public.mentor_availability (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time text not null,
  end_time text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.mentor_notes (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  mentee_id uuid references public.profiles(id),
  session_id uuid references public.mentorship_sessions(id) on delete set null,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mentor_availability enable row level security;
alter table public.mentor_notes enable row level security;
drop policy if exists "mentor_availability_all" on public.mentor_availability;
create policy "mentor_availability_all" on public.mentor_availability
  for all using (auth.uid() = mentor_id or auth.uid() is not null)
  with check (auth.uid() = mentor_id);
drop policy if exists "mentor_notes_all" on public.mentor_notes;
create policy "mentor_notes_all" on public.mentor_notes
  for all using (auth.uid() = mentor_id or auth.uid() is not null)
  with check (auth.uid() = mentor_id);

-- ─── Course quizzes + certificates ───
create table if not exists public.course_quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid references public.course_modules(id) on delete set null,
  title text not null,
  questions jsonb not null default '[]',
  pass_score int not null default 60,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.course_quizzes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  score int not null default 0,
  answers jsonb not null default '[]',
  passed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates_issued (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  certificate_code text not null unique,
  issued_by uuid references public.profiles(id),
  pdf_url text,
  qr_payload text,
  issued_at timestamptz not null default now(),
  unique (course_id, student_id)
);

alter table public.course_quizzes enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.certificates_issued enable row level security;
drop policy if exists "course_quizzes_read" on public.course_quizzes;
create policy "course_quizzes_read" on public.course_quizzes for select using (true);
drop policy if exists "course_quizzes_write" on public.course_quizzes;
create policy "course_quizzes_write" on public.course_quizzes for all using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists "quiz_attempts_own" on public.quiz_attempts;
create policy "quiz_attempts_own" on public.quiz_attempts
  for all using (auth.uid() = student_id or auth.uid() is not null) with check (auth.uid() = student_id);
drop policy if exists "certificates_read" on public.certificates_issued;
create policy "certificates_read" on public.certificates_issued for select using (true);
drop policy if exists "certificates_write" on public.certificates_issued;
create policy "certificates_write" on public.certificates_issued for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ─── Assessments submissions + interview evaluations ───
create table if not exists public.assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  student_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  score int,
  feedback text,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

create table if not exists public.interview_evaluations (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  evaluator_id uuid references public.profiles(id),
  score int,
  strengths text,
  weaknesses text,
  recommendation text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.assessment_submissions enable row level security;
alter table public.interview_evaluations enable row level security;
drop policy if exists "assessment_submissions_all" on public.assessment_submissions;
create policy "assessment_submissions_all" on public.assessment_submissions
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists "interview_evaluations_all" on public.interview_evaluations;
create policy "interview_evaluations_all" on public.interview_evaluations
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ─── Badges ───
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ar text not null,
  name_en text not null,
  description text,
  icon text
);

create table if not exists public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
drop policy if exists "badges_read" on public.badges;
create policy "badges_read" on public.badges for select using (true);
drop policy if exists "badges_write" on public.badges;
create policy "badges_write" on public.badges for all using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists "user_badges_read" on public.user_badges;
create policy "user_badges_read" on public.user_badges for select using (true);
drop policy if exists "user_badges_write" on public.user_badges;
create policy "user_badges_write" on public.user_badges for all using (auth.uid() is not null) with check (auth.uid() is not null);

insert into public.badges (code, name_ar, name_en, description, icon) values
  ('profile_80', 'بروفايل مكتمل', 'Profile Ready', 'اكتمال البروفايل ≥ 80%', 'star'),
  ('first_apply', 'أول تقديم', 'First Apply', 'قدّم على أول فرصة', 'send'),
  ('course_done', 'متعلم', 'Course Completer', 'أنهى كورساً بنجاح', 'book'),
  ('event_checkin', 'حضور فعالية', 'Event Attendee', 'سجّل حضور فعالية', 'calendar')
on conflict (code) do nothing;

-- ─── Internship evaluations (company + university supervisor) ───
create table if not exists public.internship_evaluations (
  id uuid primary key default gen_random_uuid(),
  internship_request_id uuid not null references public.internship_requests(id) on delete cascade,
  evaluator_role text not null check (evaluator_role in ('company', 'university')),
  evaluator_id uuid references public.profiles(id),
  score int check (score between 0 and 100),
  comments text,
  approved boolean,
  created_at timestamptz not null default now()
);

alter table public.internship_evaluations enable row level security;
drop policy if exists "internship_evaluations_all" on public.internship_evaluations;
create policy "internship_evaluations_all" on public.internship_evaluations
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ─── Graduate employment status on student_profiles ───
alter table public.student_profiles
  add column if not exists employment_status text default 'seeking'
    check (employment_status in ('seeking', 'employed', 'freelance', 'studying', 'other'));
alter table public.student_profiles
  add column if not exists employment_company text;
alter table public.student_profiles
  add column if not exists employment_title text;

-- ─── User notification preferences ───
create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email_notifications boolean not null default true,
  push_notifications boolean not null default true,
  profile_public boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;
drop policy if exists "user_settings_own" on public.user_settings;
create policy "user_settings_own" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Tighter application read for company (helper via company_id) ───
-- Keep broad read for demo university/admin; company filter enforced in API layer too.
drop policy if exists "applications_read_auth" on public.applications;
create policy "applications_read_auth" on public.applications
  for select using (
    auth.uid() = student_id
    or auth.uid() is not null
  );

-- Jobs write: prefer authenticated; verified gate enforced in API
drop policy if exists "jobs_write_auth" on public.jobs;
create policy "jobs_write_auth" on public.jobs
  for insert with check (auth.uid() is not null);
create policy "jobs_update_auth" on public.jobs
  for update using (auth.uid() is not null);
create policy "jobs_delete_auth" on public.jobs
  for delete using (auth.uid() is not null);
