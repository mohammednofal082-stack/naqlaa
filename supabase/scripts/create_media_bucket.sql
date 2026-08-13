-- Optional: run in SQL Editor AFTER defense if Storage bucket is needed for post images / message files.
-- Safe to re-run.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Policies (ignore errors if they already exist)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'media_public_read'
  ) then
    create policy "media_public_read" on storage.objects
      for select using (bucket_id = 'media');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'media_auth_write'
  ) then
    create policy "media_auth_write" on storage.objects
      for insert with check (bucket_id = 'media' and auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'media_auth_update'
  ) then
    create policy "media_auth_update" on storage.objects
      for update using (bucket_id = 'media' and auth.uid() is not null);
  end if;
end $$;
