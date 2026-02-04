-- Enable RLS on pedidos table
alter table public.pedidos enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Public Create Orders" on public.pedidos;
drop policy if exists "Owner Manage Orders" on public.pedidos;
drop policy if exists "Public Read Orders" on public.pedidos;

-- Policy 1: Allow Public (Anon) to Create Orders (via Showcase)
create policy "Public Create Orders" on public.pedidos
for insert
with check (true);

-- Policy 2: Allow Shop Owners to Manage (Select, Update, Delete) their own orders
create policy "Owner Manage Orders" on public.pedidos
for all
using (
    exists (
        select 1 from public.barbershops b 
        where b.id = pedidos.barbershop_id 
        and b.owner_id = auth.uid()
    )
);
