-- Add category column to products_v2
alter table public.products_v2 
add column if not exists category text not null default 'retail';

-- Add check constraint to ensure only valid categories
-- Not strictly necessary if frontend controls it, but good for safety if desired. 
-- Skipping constraint for flexibility or just trust app logic. 

-- Update existing products to stay as 'retail' (default handles it)
