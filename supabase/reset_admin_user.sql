-- SCRIPT DE RESET TOTAL (VANGUARDA ADMIN)
-- ATENÇÃO: Isso deleta o usuário 'kaylon@vanguardabarber.com' e recria do zero.

BEGIN;

-- 1. Remove usuário antigo (para evitar conflitos de senha antiga)
DELETE FROM auth.users WHERE email = 'kaylon@vanguardabarber.com';

-- 2. Habilita criptografia (garantia)
create extension if not exists pgcrypto;

-- 3. Insere Novo Usuário Limpo
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
    crypt('123456', gen_salt('bf')), -- Senha limpa
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

COMMIT;
