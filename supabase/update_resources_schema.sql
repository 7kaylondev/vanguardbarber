-- SCRIPT: ATUALIZAÇÃO - RECURSOS & UX
-- Adiciona campos para imagens, whatsapp e tipagem de produtos.

BEGIN;

-- 1. Alterar Barbershops
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barbershops' AND column_name = 'logo_url') THEN
        ALTER TABLE public.barbershops ADD COLUMN logo_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barbershops' AND column_name = 'banner_url') THEN
        ALTER TABLE public.barbershops ADD COLUMN banner_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barbershops' AND column_name = 'whatsapp') THEN
        ALTER TABLE public.barbershops ADD COLUMN whatsapp text;
    END IF;
END $$;

-- 2. Alterar Products_v2
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_v2' AND column_name = 'type') THEN
        ALTER TABLE public.products_v2 ADD COLUMN type text DEFAULT 'service';
    END IF;
END $$;

COMMIT;
