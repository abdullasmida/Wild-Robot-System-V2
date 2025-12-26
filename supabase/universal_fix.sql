-- ---------------------------------------------------------
-- UNIVERSAL DATABASE FIX & SEED 🛠️
-- ---------------------------------------------------------

-- 1. Enable Required Encryption Extension (Crucial for password hashing)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Update Enums (Safely)
-- We run these inside a strict transaction block to catch issues.
DO $$
BEGIN
    -- Attempt to add values. 'IF NOT EXISTS' handles duplicates safely.
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_admin';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'coach';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'athlete';
EXCEPTION
    WHEN OTHERS THEN 
        RAISE NOTICE 'Enum update warning (safe to ignore if values exist): %', SQLERRM;
END $$;

-- 3. Seed/Sync Auth Users (The Source of Truth)
-- We use DO UPDATE to ensure metadata is fresh even if user exists.
INSERT INTO auth.users (
    instance_id, 
    id, 
    aud, 
    role, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    created_at, 
    updated_at
)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'e9dc1d40-8fa5-4334-bea9-6b9424d2705a', 'authenticated', 'authenticated', 'abdulla.smozy@gmail.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Abdulla Smozy"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'sales@wildrobot.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sales Admin"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'coach@wildrobot.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Main Coach"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'student@wildrobot.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hero Student"}', now(), now())
ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = now();

-- 4. Sync Profiles (The App Layer)
-- Now we are guaranteed that auth.users contains our targets.
INSERT INTO public.profiles (id, full_name, role, max_allowed_devices)
SELECT 
    id, 
    raw_user_meta_data->>'full_name',
    CASE 
        WHEN email = 'abdulla.smozy@gmail.com' THEN 'admin'::public.app_role
        WHEN email = 'sales@wildrobot.com' THEN 'sales_admin'::public.app_role
        WHEN email = 'student@wildrobot.com' THEN 'athlete'::public.app_role
        ELSE 'coach'::public.app_role
    END,
    CASE WHEN email = 'abdulla.smozy@gmail.com' THEN 10 ELSE 2 END
FROM auth.users
WHERE email IN ('abdulla.smozy@gmail.com', 'sales@wildrobot.com', 'coach@wildrobot.com', 'student@wildrobot.com')
ON CONFLICT (id) DO UPDATE 
SET 
    role = EXCLUDED.role,
    max_allowed_devices = EXCLUDED.max_allowed_devices,
    full_name = EXCLUDED.full_name;

-- 5. Verification
SELECT email, role, id FROM public.profiles WHERE email IN ('coach@wildrobot.com', 'student@wildrobot.com');
