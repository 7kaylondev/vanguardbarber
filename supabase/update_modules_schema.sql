
-- Add Dynamic Module Toggles to Barbershops table
ALTER TABLE public.barbershops 
ADD COLUMN IF NOT EXISTS modulo_produtos_ativo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS modulo_agendamento_ativo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS modulo_sobre_nos_ativo boolean DEFAULT true;

-- Ensure RLS allows update (already covered by "Owner Manage Shop" policy)
