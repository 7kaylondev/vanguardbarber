-- Add quantity column to products_v2
ALTER TABLE public.products_v2 
ADD COLUMN quantity INTEGER DEFAULT 0;

-- Optional: Update existing records if needed, but default 0 is fine.
