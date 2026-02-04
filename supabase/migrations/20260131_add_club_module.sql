
-- Add modulo_clube_ativo to barbershops table
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS modulo_clube_ativo BOOLEAN DEFAULT FALSE;

-- Ensure other modules exist (just in case)
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS modulo_produtos_ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS modulo_agendamento_ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS modulo_sobre_nos_ativo BOOLEAN DEFAULT TRUE;
