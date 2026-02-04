-- SCRIPT: ATUALIZAÇÃO - DESIGNER MODE
-- Adiciona destaques e avisos.

BEGIN;

-- 1. Alterar Barbershops (Aviso)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barbershops' AND column_name = 'notice_msg') THEN
        ALTER TABLE public.barbershops ADD COLUMN notice_msg text;
    END IF;
END $$;

-- 2. Alterar Products_v2 (Destaque)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_v2' AND column_name = 'highlight') THEN
        ALTER TABLE public.products_v2 ADD COLUMN highlight boolean DEFAULT false;
    END IF;
END $$;

COMMIT;
