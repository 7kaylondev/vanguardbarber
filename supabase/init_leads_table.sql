-- SCRIPT DE INICIALIZAÇÃO: TABELA LEADS
-- Rode este script para CRIAR a tabela do zero (se ela não existir).

BEGIN;

-- 1. Cria a tabela 'leads'
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_name text NOT NULL,
  barbershop_name text NOT NULL,
  whatsapp text NOT NULL,
  email text, -- Campo novo adicionado aqui
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- 2. Habilita Segurança (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 3. Limpa políticas antigas (para garantir instalação limpa)
DROP POLICY IF EXISTS "Allow public insert" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated select" ON public.leads;
DROP POLICY IF EXISTS "Public Create Leads" ON public.leads; -- Política do schema antigo

-- 4. Cria Política: Qualquer um pode INSERIR (Public Anônimo)
CREATE POLICY "Allow public insert" 
ON public.leads 
FOR INSERT 
TO public 
WITH CHECK (true);

-- 5. Cria Política: Apenas Admin pode LER (Authenticated)
CREATE POLICY "Allow authenticated select" 
ON public.leads 
FOR SELECT 
TO authenticated 
USING (true);

-- 6. Cria Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);

COMMIT;
