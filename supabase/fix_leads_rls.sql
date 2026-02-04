-- SCRIPT DE CORREÇÃO: PERMISSÕES DE LEAD E COLUNA EMAIL
-- Rode este script no Editor SQL para corrigir o erro 'Erro ao salvar lead'

BEGIN;

-- 1. Garante que a coluna 'email' existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'email') THEN
        ALTER TABLE leads ADD COLUMN email text;
    END IF;
END $$;

-- 2. Habilita RLS na tabela (caso não esteja)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 3. Limpa políticas antigas de INSERT (para evitar duplicidade/erros)
DROP POLICY IF EXISTS "Enable insert for everyone" ON leads;
DROP POLICY IF EXISTS "Allow public insert" ON leads;
DROP POLICY IF EXISTS "Anon insert" ON leads;

-- 4. Cria política permissiva para inserção pública (Anônima)
-- Isso permite que qualquer pessoa (mesmo sem login) crie um lead.
CREATE POLICY "Allow public insert" 
ON leads 
FOR INSERT 
TO public 
WITH CHECK (true);

-- 5. Garante permissão de SELECT para o Admin (Authenticated)
DROP POLICY IF EXISTS "Allow authenticated select" ON leads;
CREATE POLICY "Allow authenticated select" 
ON leads 
FOR SELECT 
TO authenticated 
USING (true);

COMMIT;
