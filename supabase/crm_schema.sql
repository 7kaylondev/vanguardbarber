-- SCRIPT: CRM & BOOKING TRANSITION
-- Adds 'booking_method' to settings, creates 'clients' table, and links to appointments.

BEGIN;

-- 1. Update Barbershops Settings
ALTER TABLE public.barbershops 
ADD COLUMN IF NOT EXISTS booking_method text DEFAULT 'whatsapp' CHECK (booking_method IN ('whatsapp', 'crm'));

-- 2. Create Clients Table (CRM)
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    barbershop_id uuid NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(barbershop_id, phone) -- Identify client by phone within the shop
);

-- 3. Update Agendamentos (Link to Client)
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

-- 4. RLS for Clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Public can Insert (Booking Flow) - We might need to allow Upsert which requires Update?
-- Strictly, generic 'anon' shouldn't update other people's data. 
-- But for "Upsert" logic via Server Action, we bypass RLS if using Service Role OR we handle it carefully.
-- Since we use Server Actions with `createClient` using Supabase Client, it respects RLS.
-- "Public Insert": OK.
-- "Public Update": NO. Data leakage.
-- Solution: The Server Action will likely use a query to finding the client. If found, use ID. If not, create.
-- But `upsert` in Supabase Client requires privileges.
-- Better approach: The Server Action (running as user?) No, it runs as Anon probably if not logged in.
-- If running as Anon, we can only INSERT. Use "On Conflict Do Nothing"?
-- We want to update the name if changed?
-- Let's stick to "Insert if not exists" logic or use a Postgres Function `upsert_client` with `security definer`.
-- I'll define a function to safely handle client upsert without exposing the table to public updates.

CREATE POLICY "Owner Manage Clients" ON public.clients 
    USING (auth.uid() = (SELECT owner_id FROM public.barbershops WHERE id = clients.barbershop_id));

-- Allow Public Insert (Configuring constraint application requires careful thought but for now basic Insert)
CREATE POLICY "Public Insert Clients" ON public.clients FOR INSERT WITH CHECK (true);

-- 5. Helper Function for Safe Client Upsert (Security Definer)
-- This allows the anonymous web user to "Upsert" a client record by name/phone without full table access.
CREATE OR REPLACE FUNCTION public.upsert_client(
    p_barbershop_id uuid,
    p_name text,
    p_phone text
) RETURNS uuid AS $$
DECLARE
    v_client_id uuid;
BEGIN
    INSERT INTO public.clients (barbershop_id, name, phone)
    VALUES (p_barbershop_id, p_name, p_phone)
    ON CONFLICT (barbershop_id, phone) 
    DO UPDATE SET name = EXCLUDED.name, updated_at = now()
    RETURNING id INTO v_client_id;
    
    RETURN v_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
