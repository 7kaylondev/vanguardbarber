
-- 1. LEADS (Lead Trap)
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  barber_name text not null,
  barbershop_name text not null,
  whatsapp text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- 2. BARBERSHOPS (Tenants)
create table public.barbershops (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) on delete cascade unique, -- 1 Shop per Barber
  name text not null,
  slug text not null unique,
  status text default 'active' check (status in ('active', 'blocked')),
  created_at timestamptz default now()
);

-- 3. PRODUCTS (Multi-tenant)
-- Drop existing products/categories/orders if modifying, or logic to migrate.
-- Assuming Fresh Start or heavy migration. For script simplicity, I define the structure.
create table public.products_v2 (
  id uuid default gen_random_uuid() primary key,
  barbershop_id uuid references public.barbershops(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  stock int default 0,
  category_id int, -- Simplified for now, or link to global categories
  images text[] default array[]::text[],
  status boolean default true,
  created_at timestamptz default now()
);

-- 4. ORDERS (Multi-tenant)
create table public.orders_v2 (
  id uuid default gen_random_uuid() primary key,
  barbershop_id uuid references public.barbershops(id) on delete cascade not null,
  customer_data jsonb not null,
  items jsonb not null,
  total numeric(10,2) not null,
  status text default 'pending',
  delivery_method text default 'pickup',
  created_at timestamptz default now()
);

-- RLS POLICIES

-- Leads: Public Create (Landing), Superadmin Read/Update
alter table public.leads enable row level security;
create policy "Public Create Leads" on public.leads for insert with check (true);
-- Assumption: Superadmin is identified by a specific email or role claim.
-- For now, allowing authenticated users via role check or manual ID can be tricky without a 'profiles' table with 'role'.
-- We will use a simple function 'is_superadmin()' or check email.

-- Barbershops: Public Read (Slug resolution), Owner Manage
alter table public.barbershops enable row level security;
create policy "Public Read Slugs" on public.barbershops for select using (true);
create policy "Owner Manage Shop" on public.barbershops for all using (auth.uid() = owner_id);

-- Products V2: Public Read, Owner Manage
alter table public.products_v2 enable row level security;
create policy "Public Read Shop Products" on public.products_v2 for select using (true);
create policy "Owner Manage Products" on public.products_v2 for all using (
    exists (select 1 from public.barbershops b where b.id = products_v2.barbershop_id and b.owner_id = auth.uid())
);

-- Orders V2: Public Create (Checkout), Owner Manage
alter table public.orders_v2 enable row level security;
create policy "Public Create Orders" on public.orders_v2 for insert with check (true);
create policy "Owner Manage Orders" on public.orders_v2 for select using (
    exists (select 1 from public.barbershops b where b.id = orders_v2.barbershop_id and b.owner_id = auth.uid())
);

-- Create Index for Performance
create index idx_leads_status on public.leads(status);
create index idx_barbershops_slug on public.barbershops(slug);
create index idx_products_v2_shop on public.products_v2(barbershop_id);

-- 5. STORAGE BUCKETS (Avatars)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Anyone can update an avatar."
  on storage.objects for update
  with check ( bucket_id = 'avatars' );
