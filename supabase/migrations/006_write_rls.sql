-- Naqlah — comprehensive write RLS for demo + production path
-- Run after 001–005

-- Jobs / internships (already partially covered in 005; keep idempotent)
drop policy if exists "jobs_write_auth" on public.jobs;
create policy "jobs_write_auth" on public.jobs
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "internships_write_auth" on public.internships;
create policy "internships_write_auth" on public.internships
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Applications
drop policy if exists "applications_insert_auth" on public.applications;
drop policy if exists "applications_update_auth" on public.applications;
drop policy if exists "applications_company_read" on public.applications;
drop policy if exists "applications_own" on public.applications;

create policy "applications_read_auth" on public.applications
  for select using (true);
create policy "applications_insert_own" on public.applications
  for insert with check (auth.uid() = student_id);
create policy "applications_update_auth" on public.applications
  for update using (auth.uid() is not null);

-- Student profiles
drop policy if exists "student_profiles_write_own" on public.student_profiles;
create policy "student_profiles_write_own" on public.student_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Profiles (own update already exists; ensure insert for trigger + service)
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Notifications
drop policy if exists "notifications_own" on public.notifications;
drop policy if exists "notifications_read_own" on public.notifications;
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_read_own" on public.notifications
  for select using (auth.uid() = user_id or true);
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id or auth.uid() is not null);
create policy "notifications_insert_auth" on public.notifications
  for insert with check (auth.uid() is not null);

-- Messages / conversations
drop policy if exists "messages_insert_auth" on public.messages;
drop policy if exists "messages_read" on public.messages;
create policy "messages_read" on public.messages for select using (true);
create policy "messages_insert_auth" on public.messages
  for insert with check (auth.uid() = sender_id);
create policy "messages_update_auth" on public.messages
  for update using (auth.uid() is not null);

drop policy if exists "conversations_write_auth" on public.conversations;
create policy "conversations_write_auth" on public.conversations
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Saved jobs
drop policy if exists "saved_jobs_own" on public.saved_jobs;
create policy "saved_jobs_own" on public.saved_jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Talent pools
drop policy if exists "talent_pools_write_auth" on public.talent_pools;
create policy "talent_pools_write_auth" on public.talent_pools
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

alter table public.talent_pool_members enable row level security;
drop policy if exists "talent_pool_members_read" on public.talent_pool_members;
drop policy if exists "talent_pool_members_write" on public.talent_pool_members;
create policy "talent_pool_members_read" on public.talent_pool_members for select using (true);
create policy "talent_pool_members_write" on public.talent_pool_members
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- User skills
drop policy if exists "user_skills_write_own" on public.user_skills;
create policy "user_skills_write_own" on public.user_skills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Mentorship
drop policy if exists "mentor_profiles_write_auth" on public.mentor_profiles;
create policy "mentor_profiles_write_auth" on public.mentor_profiles
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Feed posts
drop policy if exists "feed_write_auth" on public.feed_posts;
create policy "feed_write_auth" on public.feed_posts
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Course enrollments already in 004; ensure present
drop policy if exists "enrollments_write_auth" on public.course_enrollments;
create policy "enrollments_write_auth" on public.course_enrollments
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
