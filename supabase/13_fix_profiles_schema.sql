-- 13_fix_profiles_schema.sql
-- Fix: Add missing 'avatar_url' and ensured name columns in 'profiles' table

DO $$ 
BEGIN
    -- 1. Check/Add avatar_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;

    -- 2. Check/Add first_name (If missing, we might split full_name if it exists, or just valid nullable)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
    END IF;

    -- 3. Check/Add last_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
    END IF;

    -- 4. Check/Add role (Should exist, but for safety)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'staff';
    END IF;

END $$;

-- 5. Refresh Schema Cache
NOTIFY pgrst, 'reload config';
