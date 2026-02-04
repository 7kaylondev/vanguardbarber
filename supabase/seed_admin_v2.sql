-- SCRIPT DE SETUP: SUPER ADMIN VANGUARDA (CORRIGIDO)
-- Rode este script no Editor SQL.

BEGIN;

-- 1. Habilita criptografia
create extension if not exists pgcrypto;

-- 2. Bloco PL/pgSQL para inserir de forma segura
DO $$
DECLARE
    dummy_id uuid;
BEGIN
    -- Verifica se já existe alguém com esse email
    SELECT id INTO dummy_id FROM auth.users WHERE email = 'kaylon@vanguardabarber.com';

    IF dummy_id IS NULL THEN
        -- Se não existe, insere
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'kaylon@vanguardabarber.com',
            crypt('123456', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );
        RAISE NOTICE 'Usuário Admin criado com sucesso.';
    ELSE
        RAISE NOTICE 'Usuário já existe. Nenhuma ação tomada.';
    END IF;
END $$;

COMMIT;
