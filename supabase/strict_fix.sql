-- ---------------------------------------------------------
-- STRICT FIX: MANUAL UPSERT (Bypasses Constraint Check) 🛡️
-- ---------------------------------------------------------

-- 1. Enable Crypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Safe Enum Update
DO $$ 
BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_admin';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'coach';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'athlete';
EXCEPTION 
    WHEN OTHERS THEN null;
END $$;

-- 3. FUNCTIONAL BLOCK: Handle Users & Profiles One by One
DO $$ 
DECLARE
    curr_uid uuid;
BEGIN
    -- ====================================================
    -- USER 1: ADMIN (abdulla.smozy@gmail.com)
    -- ====================================================
    SELECT id INTO curr_uid FROM auth.users WHERE email = 'abdulla.smozy@gmail.com';
    
    IF curr_uid IS NOT NULL THEN
        -- UPDATE EXISTING
        UPDATE auth.users 
        SET encrypted_password = crypt('password123', gen_salt('bf')),
            raw_user_meta_data = '{"full_name":"Abdulla Smozy"}'
        WHERE id = curr_uid;
    ELSE
        -- INSERT NEW
        curr_uid := 'e9dc1d40-8fa5-4334-bea9-6b9424d2705a'; -- Hardcoded for admin
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', curr_uid, 'authenticated', 'authenticated', 'abdulla.smozy@gmail.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Abdulla Smozy"}', now(), now());
    END IF;

    -- Sync Profile (Admin)
    INSERT INTO public.profiles (id, full_name, role, max_allowed_devices)
    VALUES (curr_uid, 'Abdulla Smozy', 'admin', 10)
    ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, max_allowed_devices = 10;


    -- ====================================================
    -- USER 2: COACH (coach@wildrobot.com)
    -- ====================================================
    curr_uid := NULL;
    SELECT id INTO curr_uid FROM auth.users WHERE email = 'coach@wildrobot.com';

    IF curr_uid IS NOT NULL THEN
        UPDATE auth.users 
        SET encrypted_password = crypt('password123', gen_salt('bf')),
            raw_user_meta_data = '{"full_name":"Main Coach"}'
        WHERE id = curr_uid;
    ELSE
        curr_uid := gen_random_uuid();
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', curr_uid, 'authenticated', 'authenticated', 'coach@wildrobot.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Main Coach"}', now(), now());
    END IF;

    -- Sync Profile (Coach)
    INSERT INTO public.profiles (id, full_name, role, max_allowed_devices)
    VALUES (curr_uid, 'Main Coach', 'coach', 2)
    ON CONFLICT (id) DO UPDATE SET role = 'coach', max_allowed_devices = 2;


    -- ====================================================
    -- USER 3: STUDENT (student@wildrobot.com)
    -- ====================================================
    curr_uid := NULL;
    SELECT id INTO curr_uid FROM auth.users WHERE email = 'student@wildrobot.com';

    IF curr_uid IS NOT NULL THEN
        UPDATE auth.users 
        SET encrypted_password = crypt('password123', gen_salt('bf')),
            raw_user_meta_data = '{"full_name":"Hero Student"}'
        WHERE id = curr_uid;
    ELSE
        curr_uid := gen_random_uuid();
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', curr_uid, 'authenticated', 'authenticated', 'student@wildrobot.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hero Student"}', now(), now());
    END IF;

    -- Sync Profile (Student/Athlete)
    INSERT INTO public.profiles (id, full_name, role, max_allowed_devices)
    VALUES (curr_uid, 'Hero Student', 'athlete', 2)
    ON CONFLICT (id) DO UPDATE SET role = 'athlete', max_allowed_devices = 2;

END $$;
