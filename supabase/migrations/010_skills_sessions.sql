-- Skills catalog + trainer live sessions (no payments / video interviews)

create table if not exists public.skills_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null default 'technical',
  demand int not null default 50 check (demand between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.trainer_sessions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  scheduled_at timestamptz not null,
  attendees int not null default 0,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  meeting_url text,
  created_at timestamptz not null default now()
);

alter table public.skills_catalog enable row level security;
alter table public.trainer_sessions enable row level security;

create policy "skills_catalog_read" on public.skills_catalog for select using (true);
create policy "skills_catalog_write_auth" on public.skills_catalog for all using (auth.uid() is not null);

create policy "trainer_sessions_read" on public.trainer_sessions for select using (true);
create policy "trainer_sessions_write_auth" on public.trainer_sessions for all using (auth.uid() is not null);

insert into public.skills_catalog (name, category, demand) values
  ('React', 'technical', 88),
  ('TypeScript', 'technical', 85),
  ('Node.js', 'technical', 80),
  ('SQL', 'technical', 78),
  ('Communication', 'soft', 90)
on conflict (name) do nothing;
