-- Apply role from auth signup metadata (run once after 001–007)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  r text := coalesce(new.raw_user_meta_data->>'role', 'student');
begin
  insert into public.profiles (id, email, full_name, avatar_url, roles, active_role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id),
    array[r]::text[],
    r
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    roles = excluded.roles,
    active_role = excluded.active_role;
  return new;
end;
$$;
