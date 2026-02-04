
-- 1. Structural Change
ALTER TABLE public.agendamentos
ADD COLUMN IF NOT EXISTS concluded_at timestamptz;

-- 2. Performance Indices
CREATE INDEX IF NOT EXISTS idx_agendamentos_concluded_at ON public.agendamentos(concluded_at);
CREATE INDEX IF NOT EXISTS idx_agendamentos_date_status ON public.agendamentos(date, status);

-- 3. Legacy Backfill (Approximate realized date as scheduled date)
UPDATE public.agendamentos
SET concluded_at = (date || ' ' || time)::timestamptz
WHERE status = 'completed' AND concluded_at IS NULL;
