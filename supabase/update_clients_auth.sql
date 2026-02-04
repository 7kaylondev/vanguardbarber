-- Add Auth and Club fields to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS photo_url text,
ADD COLUMN IF NOT EXISTS club_status text DEFAULT 'inactive' CHECK (club_status IN ('active', 'inactive')),
ADD COLUMN IF NOT EXISTS club_validity timestamptz,
ADD COLUMN IF NOT EXISTS club_plan_id uuid REFERENCES public.products_v2(id);

-- Create Index for fast lookup by Auth ID
CREATE INDEX IF NOT EXISTS idx_clients_auth_user_id ON public.clients(auth_user_id);

-- RLS: Allow users to read/update their OWN client record
-- Note: 'public' role (anon) still needs to Insert (for booking without login), or maybe we keep that open?
-- Policies for "Client Portal":
CREATE POLICY "Users can manage their own client profile" ON public.clients
FOR ALL
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);
