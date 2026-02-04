-- FIX: Table 'profiles' already exists but is missing columns.
-- Run this to add the required columns.

alter table public.profiles 
add column if not exists avatar_url text;

alter table public.profiles 
add column if not exists full_name text;

alter table public.profiles 
add column if not exists email text;

-- Re-run the migration of data
insert into public.profiles (id, avatar_url, full_name, email)
select distinct on (auth_user_id) auth_user_id, photo_url, name, email
from public.clients
where auth_user_id is not null
on conflict (id) 
do update set 
    avatar_url = excluded.avatar_url,
    full_name = excluded.full_name;

-- Ensure Policies Exist (Idempotent)
alter table public.profiles enable row level security;

drop policy if exists "Public Read Profiles" on public.profiles;
create policy "Public Read Profiles" on public.profiles for select using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
