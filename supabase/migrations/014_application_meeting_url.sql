-- Interview meeting URL on applications (external link only, not in-app video)
alter table public.applications
  add column if not exists meeting_url text;
