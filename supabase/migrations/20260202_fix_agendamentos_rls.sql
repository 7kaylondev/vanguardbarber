-- FIX RLS FOR AGENDAMENTOS TABLE
-- Goal: Fix the "Cross-Join Visibility" issue where owners can't see appointments of clients, causing the CRM filter to hide them.

-- 1. Enable RLS (Ensure it's on)
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- 2. Drop potential blocking policies
DROP POLICY IF EXISTS "Shop Owners can view their shop appointments" ON public.agendamentos;
DROP POLICY IF EXISTS "Shop Owners can manage their shop appointments" ON public.agendamentos;

-- 3. Policy: Shop Owners can VIEW ALL appointments of their shop
-- Uses the SAME secure function created in the previous step
CREATE POLICY "Shop Owners can view their shop appointments"
ON public.agendamentos
FOR SELECT
USING ( public.check_is_shop_owner(barbershop_id) );

-- 4. Policy: Shop Owners can MANAGE ALL appointments of their shop
CREATE POLICY "Shop Owners can manage their shop appointments"
ON public.agendamentos
FOR ALL
USING ( public.check_is_shop_owner(barbershop_id) );
