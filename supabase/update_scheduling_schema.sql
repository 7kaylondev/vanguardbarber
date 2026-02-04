-- SCRIPT: SCHEDULING & CHECKOUT SYSTEM (CORRIGIDO)

BEGIN;

-- 1. Tabela de Configuração de Horários
CREATE TABLE IF NOT EXISTS public.horarios_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    barbershop_id uuid REFERENCES public.barbershops(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL, -- 0=Domingo, 1=Segunda...
    start_time time NOT NULL DEFAULT '09:00',
    end_time time NOT NULL DEFAULT '19:00',
    lunch_start time,
    lunch_end time,
    slot_duration integer DEFAULT 30, -- minutos
    is_closed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(barbershop_id, day_of_week)
);

-- 2. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    barbershop_id uuid REFERENCES public.barbershops(id) ON DELETE CASCADE,
    service_id uuid REFERENCES public.products_v2(id) ON DELETE SET NULL, 
    client_name text NOT NULL,
    client_phone text NOT NULL,
    date date NOT NULL,
    time time NOT NULL,
    status text DEFAULT 'confirmed', -- confirmed, pending, cancelled
    origin text DEFAULT 'site',
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    barbershop_id uuid REFERENCES public.barbershops(id) ON DELETE CASCADE,
    items jsonb NOT NULL, -- Array de itens [{id, name, price, qty}]
    total numeric NOT NULL,
    delivery_type text NOT NULL, -- 'pickup' or 'delivery'
    address text,
    client_name text NOT NULL,
    client_phone text NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies (Basic)
ALTER TABLE public.horarios_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Allow public read for config (needed for slots)
CREATE POLICY "Public Config Read" ON public.horarios_config FOR SELECT USING (true);
CREATE POLICY "Public Agendamentos Read" ON public.agendamentos FOR SELECT USING (true);
CREATE POLICY "Public Pedidos Insert" ON public.pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Agendamentos Insert" ON public.agendamentos FOR INSERT WITH CHECK (true);

-- Allow Owner Full Access
CREATE POLICY "Owner Config All" ON public.horarios_config USING (auth.uid() = (SELECT owner_id FROM public.barbershops WHERE id = horarios_config.barbershop_id));
CREATE POLICY "Owner Agendamentos All" ON public.agendamentos USING (auth.uid() = (SELECT owner_id FROM public.barbershops WHERE id = agendamentos.barbershop_id));
CREATE POLICY "Owner Pedidos All" ON public.pedidos USING (auth.uid() = (SELECT owner_id FROM public.barbershops WHERE id = pedidos.barbershop_id));

COMMIT;
