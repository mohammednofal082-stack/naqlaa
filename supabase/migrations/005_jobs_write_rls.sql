-- Naqlah — write policies for jobs/internships (demo)

drop policy if exists "jobs_write_auth" on public.jobs;
create policy "jobs_write_auth" on public.jobs
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "internships_write_auth" on public.internships;
create policy "internships_write_auth" on public.internships
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
