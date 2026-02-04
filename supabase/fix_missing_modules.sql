-- Comprehensive Column Addition for Barbershops
-- Addresses missing columns for settings and modules

ALTER TABLE public.barbershops 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS whatsapp_orders text,
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS min_order_value numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS status_manual boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS booking_method text DEFAULT 'whatsapp',
ADD COLUMN IF NOT EXISTS modulo_agendamento_ativo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS modulo_produtos_ativo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS modulo_clube_ativo boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS modulo_sobre_nos_ativo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS primary_color text,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS notice_msg text;
