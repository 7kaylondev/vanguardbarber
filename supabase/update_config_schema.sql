-- Add Configuration Columns to Barbershops
-- task_id: 1201

ALTER TABLE public.barbershops
ADD COLUMN IF NOT EXISTS status_manual BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_orders TEXT, -- If different from main whatsapp
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS min_order_value NUMERIC(10,2) DEFAULT 0;

-- Comment on columns
COMMENT ON COLUMN public.barbershops.status_manual IS 'If true, forces the shop to be displayed as Closed regardless of hours.';
COMMENT ON COLUMN public.barbershops.min_order_value IS 'Value to unlock delivery option.';
