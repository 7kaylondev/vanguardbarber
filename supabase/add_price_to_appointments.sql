-- Add price column to agendamentos to store the finalized transaction value
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS price numeric(10,2);

-- Optional: Update existing confirmed appointments to use the current product price as fallback
-- This is a best-effort backfill.
UPDATE public.agendamentos a
SET price = p.price
FROM public.products_v2 p
WHERE a.service_id = p.id
AND a.price IS NULL;
