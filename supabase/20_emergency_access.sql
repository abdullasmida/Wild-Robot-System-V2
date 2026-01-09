/*
  # EMERGENCY ACCESS RESTORE (FIXED) 🔓
  
  Goal: Ensure users can ABSOLUTELY insert and view their own profile.
  Fixes "policy already exists" errors by dropping them first.
*/

BEGIN;

-- 1. ENSURE POLICIES ARE CORRECT
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop potential conflicting policies matching this name (Safe Drops)
DROP POLICY IF EXISTS "Universally View Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- ALLOW SELECT (View Own)
CREATE POLICY "Universally View Own Profile" 
ON public.profiles FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- ALLOW INSERT (Create Own) - Critical for Self-Healing
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- ALLOW UPDATE (Edit Own)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);


-- 2. HARD FIX FOR SPECIFIC USER (test14)
-- This runs as System Admin (bypassing RLS) within the SQL Editor
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'first_name', split_part(email, '@', 1)), 
    COALESCE(raw_user_meta_data->>'last_name', ''), 
    'coach'
FROM auth.users 
WHERE email = 'test14@wildrobot-app.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'coach' 
WHERE public.profiles.role IS NULL;

COMMIT;
