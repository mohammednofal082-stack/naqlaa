-- Schema for media, lesson video, message attachments, company fields, assessment questions
-- Safe for Supabase hosted migrations (no storage.objects policies — those often fail).
-- After this succeeds, create a public Storage bucket named "media" in Dashboard (optional).

alter table public.course_lessons
  add column if not exists video_url text;

alter table public.messages
  add column if not exists attachment_url text;

alter table public.companies
  add column if not exists email text;

alter table public.companies
  add column if not exists employees_count int default 0;

alter table public.companies
  add column if not exists founded_year int;

alter table public.assessments
  add column if not exists description text;

alter table public.assessments
  add column if not exists questions jsonb default '[]'::jsonb;
