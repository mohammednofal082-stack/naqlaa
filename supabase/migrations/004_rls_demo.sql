-- Naqlah — broaden RLS for demo / committee review (after 001–003)
-- Allows public read of catalog data while keeping writes authenticated

alter table public.companies enable row level security;
alter table public.courses enable row level security;
alter table public.events enable row level security;
alter table public.feed_posts enable row level security;
alter table public.talent_pools enable row level security;
alter table public.conversations enable row level security;
alter table public.mentor_profiles enable row level security;
alter table public.mentorship_sessions enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.user_skills enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "companies_public_read" on public.companies;
create policy "companies_public_read" on public.companies for select using (true);
create policy "companies_write_auth" on public.companies for all using (auth.uid() is not null);

drop policy if exists "courses_public_read" on public.courses;
create policy "courses_public_read" on public.courses for select using (true);
create policy "courses_write_auth" on public.courses for all using (auth.uid() is not null);

drop policy if exists "events_public_read" on public.events;
create policy "events_public_read" on public.events for select using (true);
create policy "events_write_auth" on public.events for all using (auth.uid() is not null);

drop policy if exists "feed_public_read" on public.feed_posts;
create policy "feed_public_read" on public.feed_posts for select using (true);
create policy "feed_write_auth" on public.feed_posts for all using (auth.uid() is not null);

drop policy if exists "talent_pools_public_read" on public.talent_pools;
create policy "talent_pools_public_read" on public.talent_pools for select using (true);

drop policy if exists "mentors_public_read" on public.mentor_profiles;
create policy "mentors_public_read" on public.mentor_profiles for select using (true);

drop policy if exists "sessions_read" on public.mentorship_sessions;
create policy "sessions_read" on public.mentorship_sessions for select using (true);
create policy "sessions_write_auth" on public.mentorship_sessions for all using (auth.uid() is not null);

drop policy if exists "enrollments_read" on public.course_enrollments;
create policy "enrollments_read" on public.course_enrollments for select using (true);
create policy "enrollments_write_auth" on public.course_enrollments for all using (auth.uid() is not null);

drop policy if exists "saved_jobs_own" on public.saved_jobs;
create policy "saved_jobs_own" on public.saved_jobs for all using (auth.uid() = user_id);

drop policy if exists "user_skills_read" on public.user_skills;
create policy "user_skills_read" on public.user_skills for select using (true);
create policy "user_skills_write_own" on public.user_skills for all using (auth.uid() = user_id);

drop policy if exists "audit_read_auth" on public.audit_logs;
create policy "audit_read_auth" on public.audit_logs for select using (auth.uid() is not null);
create policy "audit_insert_auth" on public.audit_logs for insert with check (auth.uid() is not null);

drop policy if exists "conversations_read" on public.conversations;
create policy "conversations_read" on public.conversations for select using (true);
create policy "messages_insert_auth" on public.messages for insert with check (auth.uid() = sender_id);
drop policy if exists "messages_read" on public.messages;
create policy "messages_read" on public.messages for select using (true);

-- Allow reading student profiles for talent / match demos
drop policy if exists "student_profiles_public_read" on public.student_profiles;
create policy "student_profiles_public_read" on public.student_profiles for select using (true);

drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles for select using (true);

-- Applications: company side can list (demo)
drop policy if exists "applications_company_read" on public.applications;
create policy "applications_company_read" on public.applications for select using (true);
create policy "applications_insert_auth" on public.applications for insert with check (auth.uid() = student_id);
create policy "applications_update_auth" on public.applications for update using (auth.uid() is not null);
