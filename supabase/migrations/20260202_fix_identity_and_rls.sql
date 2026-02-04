-- FIX: DENORMALIZE IDENTITY (Robust RLS)
-- Goal: Add owner_id to clients and agendamentos to allow simple, un-joinable RLS.

-- 1. Add owner_id to CLIENTS
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS owner_id uuid references auth.users(id);

-- 2. Add owner_id to AGENDAMENTOS
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS owner_id uuid references auth.users(id);

-- 3. Backfill owner_id based on barbershop linkage (Crucial for existing data)
-- For Clients:
UPDATE public.clients c
SET owner_id = b.owner_id
FROM public.barbershops b
WHERE c.barbershop_id = b.id
AND c.owner_id IS NULL;

-- For Agendamentos:
UPDATE public.agendamentos a
SET owner_id = b.owner_id
FROM public.barbershops b
WHERE a.barbershop_id = b.id
AND a.owner_id IS NULL;

-- 4. Enable RLS (Ensure it's on)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- 5. UPDATE RLS POLICIES (Simpler & Robust)

-- CLIENTS
DROP POLICY IF EXISTS "Shop Owners can view their shop clients" ON public.clients;
DROP POLICY IF EXISTS "Shop Owners can manage their shop clients" ON public.clients;

CREATE POLICY "Shop Owners can view their shop clients"
ON public.clients
FOR SELECT
USING ( auth.uid() = owner_id );

CREATE POLICY "Shop Owners can manage their shop clients"
ON public.clients
FOR ALL
USING ( auth.uid() = owner_id );

-- AGENDAMENTOS
DROP POLICY IF EXISTS "Shop Owners can view their shop appointments" ON public.agendamentos;
DROP POLICY IF EXISTS "Shop Owners can manage their shop appointments" ON public.agendamentos;

CREATE POLICY "Shop Owners can view their shop appointments"
ON public.agendamentos
FOR SELECT
USING ( auth.uid() = owner_id );

CREATE POLICY "Shop Owners can manage their shop appointments"
ON public.agendamentos
FOR ALL
USING ( auth.uid() = owner_id );

-- 6. KEEP Customer Policies (Don't break user view)
-- (Users can still view their own profile/appointments)
-- Assuming existing policies like "Users can manage their own client profile" handle auth_user_id checks.
