-- SCRIPT: FIX CRM SCHEMA & CONSTRAINTS
-- Run this in Supabase SQL Editor to ensure CRM works correctly.

BEGIN;

-- 1. Ensure 'clients' table has correct structure
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    barbershop_id uuid NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    notes text,
    auth_user_id uuid, -- Ensure this column exists
    photo_url text, -- Ensure this column exists
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Ensure Unique Constraint for Upsert (Review Logic)
-- We need (barbershop_id, phone) to be unique for ON CONFLICT to work.
-- First, handle duplicates if any (keep latest).
-- This complex query deletes older duplicates:
DELETE FROM public.clients a USING (
    SELECT MIN(ctid) as ctid, phone, barbershop_id
    FROM public.clients 
    GROUP BY phone, barbershop_id HAVING COUNT(*) > 1
) b
WHERE a.phone = b.phone 
AND a.barbershop_id = b.barbershop_id 
AND a.ctid <> b.ctid;

-- Now add constraint
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_barbershop_id_phone_key;
ALTER TABLE public.clients ADD CONSTRAINT clients_barbershop_id_phone_key UNIQUE (barbershop_id, phone);

-- 3. Ensure 'auth_user_id' column exists (if table existed before)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS auth_user_id uuid;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS photo_url text;

-- 4. Re-create Upsert Function (Security Definer)
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

-- 5. Fix Agendamentos Link
-- Try to link orphaned appointments to clients by phone number
UPDATE public.agendamentos a
SET client_id = c.id
FROM public.clients c
WHERE a.client_id IS NULL
AND a.client_phone = c.phone
AND a.barbershop_id = c.barbershop_id;

COMMIT;
