-- Ensure category exists
alter table public.products_v2 
add column if not exists category text not null default 'retail';

-- Add is_visible_online column
alter table public.products_v2 
add column if not exists is_visible_online boolean not null default true;

-- Update existing records
update public.products_v2 
set is_visible_online = false 
where category = 'bar';
