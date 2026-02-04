
-- Migration: Add concluded_at to agendamentos
ALTER TABLE public.agendamentos
ADD COLUMN concluded_at timestamptz;

-- Optional: Backfill existing completed appointments with their date + time (approximate)
UPDATE public.agendamentos
SET concluded_at = (date || ' ' || time)::timestamptz
WHERE status = 'completed' AND concluded_at IS NULL;
