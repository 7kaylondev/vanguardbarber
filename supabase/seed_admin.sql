-- SCRIPT DE SETUP: SUPER ADMIN VANGUARDA
-- Rode este script no Editor SQL do seu painel Supabase.

-- 1. Habilita a extensão de criptografia (se não estiver ativa)
create extension if not exists pgcrypto;

-- 2. Insere (ou ignora se já existir) o usuário 'kaylon@vanguardabarber.com'
-- A senha '123456' é criptografada usando o algoritmo blowfish (bf) padrão do Supabase Auth.
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
    '00000000-0000-0000-0000-000000000000', -- instance_id padrão
    gen_random_uuid(), -- gera um novo UUID
    'authenticated',
    'authenticated',
    'kaylon@vanguardabarber.com', -- SEU EMAIL
    crypt('123456', gen_salt('bf')), -- SUA SENHA (123456)
    now(), -- email confirmado instantaneamente
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
)
ON CONFLICT (email) DO NOTHING; -- Se já existe, não faz nada (seguro)

-- 3. Confirmação
-- Se o comando rodar sem erro, tente fazer login em /vanguarda-hq agora.
