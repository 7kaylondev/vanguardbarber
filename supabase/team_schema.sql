
-- Tabela de Profissionais
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    photo_url TEXT,
    specialty TEXT,
    commission_percent NUMERIC(5,2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar professional_id em agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL;

-- Adicionar professional_id em horarios_config (Para horarios individuais)
ALTER TABLE public.horarios_config
ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE;

-- Atualizar Unique/Index para horarios_config
-- Antes era unique(barbershop_id, day_of_week)
-- Agora deve considerar professional_id (onde pode ser NULL para geral)
-- Drop existing constraint if it exists (assuming name 'horarios_config_barbershop_id_day_of_week_key' or similar)
ALTER TABLE public.horarios_config DROP CONSTRAINT IF EXISTS horarios_config_barbershop_id_day_of_week_key;

-- Nova constraint unique considerando NULLs em professional_id?
-- Postgres trata NULL != NULL em unique constraint default. 
-- Para garantir unicidade com NULL, podemos usar um índice condicional ou unique index.
-- Vamos permitir multiplos horarios por dia SE professional_id for diferente.
-- Mas para o mesmo professional_id (ou null) e mesmo dia, deve ser único.
CREATE UNIQUE INDEX IF NOT EXISTS unique_schedule_per_pro 
ON public.horarios_config (barbershop_id, day_of_week) 
WHERE professional_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_schedule_per_specific_pro
ON public.horarios_config (barbershop_id, day_of_week, professional_id)
WHERE professional_id IS NOT NULL;
