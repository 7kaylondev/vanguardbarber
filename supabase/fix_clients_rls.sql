-- Policy for Clients Table
-- Allow users to update their own client record (CRM Sync)

-- 1. Enable RLS (if not already enabled, though usually good to ensure)
alter table public.clients enable row level security;

-- 2. Policy: Update Own Record
-- Drop existing if conflict, though names are usually unique
drop policy if exists "Users can update own client profile" on public.clients;

create policy "Users can update own client profile"
on public.clients
for update
using ( auth.uid() = auth_user_id )
with check ( auth.uid() = auth_user_id );

-- 3. Policy: Read Own Record (Already implicitly needed for the update check usually, but good to have explicit select)
drop policy if exists "Users can read own client profile" on public.clients;

create policy "Users can read own client profile"
on public.clients
for select
using ( auth.uid() = auth_user_id );
