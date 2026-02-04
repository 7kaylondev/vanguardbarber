-- SCRIPT: ATUALIZAÇÃO DO SCHEMA (Dashboard & Vitrine)
-- Rode este script para adicionar os campos de customização.

BEGIN;

-- 1. Alterar Tabela Barbershops
DO $$
BEGIN
    -- Bio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barbershops' AND column_name = 'bio') THEN
        ALTER TABLE public.barbershops ADD COLUMN bio text;
    END IF;

    -- Cor Principal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barbershops' AND column_name = 'primary_color') THEN
        ALTER TABLE public.barbershops ADD COLUMN primary_color text DEFAULT '#d4af37';
    END IF;

    -- Instagram
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barbershops' AND column_name = 'instagram_url') THEN
        ALTER TABLE public.barbershops ADD COLUMN instagram_url text;
    END IF;
END $$;

-- 2. Garantir Políticas RLS para Produtos (Caso não existam)
ALTER TABLE public.products_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner Manage Products" ON public.products_v2;

CREATE POLICY "Owner Manage Products" 
ON public.products_v2 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.barbershops b 
        WHERE b.id = products_v2.barbershop_id 
        AND b.owner_id = auth.uid()
    )
);

COMMIT;
