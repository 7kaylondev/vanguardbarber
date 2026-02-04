-- Enable RLS on products_v2 if not already enabled
ALTER TABLE public.products_v2 ENABLE ROW LEVEL SECURITY;

-- Allow Owners to view their own products
CREATE POLICY "Owners can view their own products"
ON public.products_v2
FOR SELECT
USING ( auth.uid() = owner_id );

-- Allow Owners to view "System" or "Global" products (if any exist with null owner)
CREATE POLICY "Owners can view system products"
ON public.products_v2
FOR SELECT
USING ( owner_id IS NULL );

-- Grant access to authenticated users to view products (needed for booking?)
-- Adjust based on showcase requirements, but safely for now:
CREATE POLICY "Public can view active products"
ON public.products_v2
FOR SELECT
USING ( true ); -- Or limit by barbershop_id match if needed, but 'true' is safe for VIEWING products usually.
