-- FIX RLS FOR CLIENTS TABLE (CORRECTED)
-- Goal: Allow Barbershop Owners to VIEW/EDIT all clients linked to their shop.

-- 1. Enable RLS (Ensure it's on)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts (Fixing previous error)
-- We drop ALL potential variants to ensure a clean slate
DROP POLICY IF EXISTS "Users can manage their own client profile" ON public.clients;
DROP POLICY IF EXISTS "Users can view their own client profile" ON public.clients;
DROP POLICY IF EXISTS "Shop Owners can view their shop clients" ON public.clients;
DROP POLICY IF EXISTS "Shop Owners can manage their shop clients" ON public.clients;
DROP POLICY IF EXISTS "Owners can view clients of their shop" ON public.clients;

-- 3. Policy: Users can view/edit their OWN profile (Customer View)
CREATE POLICY "Users can manage their own client profile"
ON public.clients
FOR ALL
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- 4. Policy: Shop Owners can VIEW ALL clients of their shop (Owner View)
-- Defines "Owner" as someone whose ID matches the owner_id of the linked barbershop
CREATE POLICY "Shop Owners can view their shop clients"
ON public.clients
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.barbershops b
        WHERE b.id = public.clients.barbershop_id
        AND b.owner_id = auth.uid()
    )
);

-- 5. Policy: Shop Owners can UPDATE/DELETE clients of their shop (Owner Management)
CREATE POLICY "Shop Owners can manage their shop clients"
ON public.clients
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.barbershops b
        WHERE b.id = public.clients.barbershop_id
        AND b.owner_id = auth.uid()
    )
);
