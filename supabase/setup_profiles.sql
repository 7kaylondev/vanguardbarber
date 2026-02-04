-- 1. Create Profiles Table (Single Source of Truth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  avatar_url text,
  full_name text,
  email text,
  updated_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Policies
drop policy if exists "Public Read Profiles" on public.profiles;
create policy "Public Read Profiles" on public.profiles for select using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- 4. Migration: Copy existing avatars from clients to profiles
-- We distinct by auth_user_id to avoid duplicates
insert into public.profiles (id, avatar_url, full_name, email)
select distinct on (auth_user_id) auth_user_id, photo_url, name, email
from public.clients
where auth_user_id is not null
on conflict (id) 
do update set 
    avatar_url = excluded.avatar_url,
    full_name = excluded.full_name;
