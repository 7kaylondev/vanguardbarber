-- Add inactivity_threshold_days to barbershops table
-- Default to 45 days if not set
ALTER TABLE public.barbershops 
ADD COLUMN IF NOT EXISTS inactivity_threshold_days integer DEFAULT 45;
