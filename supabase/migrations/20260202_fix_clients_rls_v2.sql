-- FIX RLS FOR CLIENTS TABLE V2 (ROBUST)
-- Goal: Fix "Policy Exists" error and "Permisson Denied" by using a secure checking function.

-- 1. Create a Helper Function (SECURITY DEFINER)
-- This function runs with "superuser" privileges, bypassing any RLS on the 'barbershops' table itself.
CREATE OR REPLACE FUNCTION public.check_is_shop_owner(target_shop_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.barbershops
    WHERE id = target_shop_id
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop OLD policies to be safe
DROP POLICY IF EXISTS "Shop Owners can view their shop clients" ON public.clients;
DROP POLICY IF EXISTS "Shop Owners can manage their shop clients" ON public.clients;

-- 3. Re-Create Policy using the Helper Function
-- This is much more reliable than a raw subquery in the USING clause.
CREATE POLICY "Shop Owners can view their shop clients"
ON public.clients
FOR SELECT
USING ( public.check_is_shop_owner(barbershop_id) );

CREATE POLICY "Shop Owners can manage their shop clients"
ON public.clients
FOR UPDATE
USING ( public.check_is_shop_owner(barbershop_id) );
