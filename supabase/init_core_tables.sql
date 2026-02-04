-- SCRIPT DE INICIALIZAÇÃO: CORE (BARBERSHOPS & PRODUTOS)
-- Rode este script para CRIAR as tabelas do zero com as colunas novas.

BEGIN;

-- 1. TABELA BARBERSHOPS (Tenants)
CREATE TABLE IF NOT EXISTS public.barbershops (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- Link com Usuário Auth
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  
  -- Campos de Customização (Novos)
  bio text,
  primary_color text DEFAULT '#d4af37',
  instagram_url text,

  created_at timestamptz DEFAULT now(),
  
  -- Garante que cada usuário só tenha 1 barbearia (Regra de Negócio Atual)
  UNIQUE(owner_id) 
);

-- Habilita RLS
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;

-- Políticas de Barbershop
DROP POLICY IF EXISTS "Public Read Slugs" ON public.barbershops;
CREATE POLICY "Public Read Slugs" ON public.barbershops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner Manage Shop" ON public.barbershops;
CREATE POLICY "Owner Manage Shop" ON public.barbershops FOR ALL USING (auth.uid() = owner_id);
-- Permite que o Service Role (Admin) faça insert/update sem restrição (o RLS é ignorado pelo Service Role Key, mas ok definir)

-- 2. TABELA PRODUTOS (Serviços)
CREATE TABLE IF NOT EXISTS public.products_v2 (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id uuid REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  duration_min int, -- Duração em minutos
  image_url text,   -- Foto do corte
  status boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Habilita RLS
ALTER TABLE public.products_v2 ENABLE ROW LEVEL SECURITY;

-- Políticas de Produtos
DROP POLICY IF EXISTS "Public Read Shop Products" ON public.products_v2;
CREATE POLICY "Public Read Shop Products" ON public.products_v2 FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner Manage Products" ON public.products_v2;
CREATE POLICY "Owner Manage Products" ON public.products_v2 FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.barbershops b 
        WHERE b.id = products_v2.barbershop_id 
        AND b.owner_id = auth.uid()
    )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_barbershops_slug ON public.barbershops(slug);
CREATE INDEX IF NOT EXISTS idx_products_v2_shop ON public.products_v2(barbershop_id);

COMMIT;
